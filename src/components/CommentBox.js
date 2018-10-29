import React, {Component} from 'react'
import Notification from './Notification'

const styles = {
  button: {
    transition: 'all 0.4s',
    outline: 'none',
    border: 'none',
    color: 'white',
    backgroundColor: '#42b983',
    cursor: 'pointer',
  },
  label: {
    boxSizing: 'border-box',
    display: 'block',
    margin: '10px 0'
  },
  span: {
    display: 'inline-block',
    fontSize: '12px'
  },
  input: {
    padding: '0 10px',
    boxSizing: 'border-box',
    height: '22px',
    width: '160px',
    outline: 'none',
    borderRadius: '4px',
  }
}

export default class commentBox extends Component {
  constructor(props) {
    super(props)
    this.state = {
      thread: null,
      message: '',
      authorName: '',
      authorEmail: '',
      authorNameValid: true,
      authorEmailValid: true,
      messageValid: true,
      showCommentMeta: false,
      disabled: false,
      notificationTitle: '',
      notificationBody: '',
      showNotification: false,
      show: !props.replyTo,
      total: null,
      loading: false
    }
  }

  async componentWillMount() {
    this.setState({loading: true})

    const identifier = window.disqusProxy.identifier
    const query = 'identifier=' + encodeURIComponent(identifier)
    const url = '//' + window.disqusProxy.server + ':'
      + window.disqusProxy.port.toString() + '/api/getThreads'
    const result = await fetch(url + '?' + query)
    const res = await result.json()
    this.setState({loading: false})

    if (res.code === 0 && res.response.length) {
      const thread = res.response[0].id
      const total = res.response[0].posts
      this.setState({thread, total})

      // 反代显示评论数 See https://help.disqus.com/developer/adding-comment-count-links-to-your-home-page
      const links = document.getElementsByTagName('a')
      for (const link of links) {
        if (/#disqus_thread$/.test(link.href)) link.textContent = `${total} 条评论`
      }

      const message = localStorage.getItem(thread)
      if (typeof message === 'string') this.setState({message})

    } else if (typeof res.code === 'number') {
      this.setState({
        notificationTitle: 'thread 获取错误',
        notificationBody: res.response,
        showNotification: true
      })
    }
  }

  componentDidMount() {
    const {replyTo} = this.props
    if (replyTo) setTimeout(() => this.setState({show: true}), 0)
  }

  handleChange = (e, key) => {
    this.setState({
      [key]: e.target.value,
      [key + 'Valid']: true
    })
  }

  async postComment() {
    if (!this.state.thread) return

    this.setState({
      message: this.state.message.trim(),
      authorName: this.state.authorName.trim(),
      authorEmail: this.state.authorEmail.trim(),
    })

    const checkValid = () => {
      let valid = true
      ;['message', 'authorName', 'authorEmail'].forEach(item => {
        if (this.state[item] === '') {
          valid = false
          this.setState({[item + 'Valid']: false})
        }
      })

      const email = this.state.authorEmail
      if (!/^[-a-zA-Z0-9.]+@[-a-zA-Z0-9]+\.[-a-zA-Z0-9]+$/.test(email)) {
        valid = false
        this.setState({authorEmailValid: false})
      }
      return valid
    }

    const isValid = checkValid()

    if (!isValid) return false

    this.setState({disabled: true})

    localStorage.setItem(this.state.thread.toString(), this.state.message)

    const payload = {
      thread: this.state.thread,
      author_name: this.state.authorName,
      author_email: this.state.authorEmail,
      message: this.state.message
    }

    if (this.props.replyTo) payload.parent = this.props.replyTo

    const url = '//' + window.disqusProxy.server + ':'
      + window.disqusProxy.port.toString() + '/api/createComment'

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
  }

  commentMetaToggle = () => {
    this.setState({showCommentMeta: !this.state.showCommentMeta})
  }

  async submit() {
    if (this.state.disabled) return
    const response = await this.postComment()
    if (!response) return
    const res = await response.json()
    this.setState({disabled: false})

    if (res.code === 0) {
      localStorage.removeItem(this.state.thread)
      this.setState({
        message: '',
        authorName: '',
        authorEmail: '',
        showCommentMeta: false,
        notificationTitle: '发表成功',
        notificationBody: '请等待审核',
        showNotification: true,
      })
      setTimeout(() => {
        this.setState({showNotification: false})
      }, 5000)
    } else if (typeof res.code === 'number') {
      this.setState({
        notificationTitle: '发表失败',
        notificationBody: res.response,
        showNotification: true,
      })
      setTimeout(() => {
        this.setState({showNotification: false})
      }, 5000)
    }
  }

  render() {
    const {replyTo} = this.props
    const {show, total} = this.state

    return (
      <div style={{
        padding: '10px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          height: show ? '110px' : 0,
          transition: 'all 0.5s',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {!replyTo && <div style={{
            position: 'absolute',
            paddingTop: '6px'
          }}><img src={blockies.create({
            seed: 'newuser',
            color: 'yellow',
            bgcolor: 'green',
            spotcolor: 'red'
          }).toDataURL()} alt="avatar" style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            boxShadow: '1px 1px 3px 0.5px #ccc'
          }}/>
          </div>}
          <textarea
            value={this.state.message}
            style={{
              position: 'absolute',
              top: '0',
              left: replyTo ? 0 : '70px',
              width: replyTo ? '100%' : 'calc(100% - 70px)',
              height: '100px',
              boxSizing: 'border-box',
              fontSize: '16px',
              letterSpacing: '0.7px',
              padding: '12px',
              color: '#555',
              backgroundColor: '#f8f8f8',
              outline: 'none',
              border: this.state.messageValid ? 'none' : 'border: 1px solid #ff7500',
              resize: 'none',
              borderRadius: '8px',
              overflow: 'auto',
              boxShadow: '1px 1px 2px -1px #aaa',
            }}
            disabled={this.state.disabled}
            onChange={e => this.handleChange(e, 'message')}/>
        </div>
        {this.state.showNotification && (
          <Notification title={this.state.notificationTitle}
                        body={this.state.notificationBody}
                        duration={4000}/>
        )}
        <button style={{
          ...styles.button,
          ...{
            fontSize: '14px',
            marginLeft: 'calc(100% - 46px)',
            padding: '2px 16px',
            borderRadius: '4px'
          }
        }} onClick={this.commentMetaToggle}>
          <i className="fa fa-comment-o" aria-hidden="true"/>
        </button>
        <div style={{
          marginLeft: 'calc(100% - 260px)',
          transition: 'all 0.5s',
          color: '#666',
          overflow: 'hidden',
          height: this.state.showCommentMeta ? 120 : 0
        }}>
          <label style={styles.label}>
            <span style={styles.span}><i className="fa fa-user-o" aria-hidden="true"/> 昵称（公开） </span>
            <input type="text"
                   style={{
                     ...styles.input,
                     border: this.state.authorNameValid ? '1px solid #ccc' : ' 1px solid #ff7500',
                     marginLeft: 13
                   }}
                   value={this.state.authorName}
                   disabled={this.state.disabled}
                   onChange={e => this.handleChange(e, 'authorName')}
            />
          </label>
          <label style={styles.label}>
            <span style={styles.span}><i className="fa fa-envelope-o" aria-hidden="true"/> 邮箱（非公开） </span>
            <input type="text"
                   style={{
                     ...styles.input,
                     border: this.state.authorEmailValid ? '1px solid #ccc' : ' 1px solid #ff7500'
                   }}
                   value={this.state.authorEmail}
                   disabled={this.state.disabled}
                   onChange={e => this.handleChange(e, 'authorEmail')}
            />
          </label>
          <button onClick={() => this.submit()} style={{
            ...styles.button,
            ...{
              marginLeft: 'calc(100% - 46px)',
              outline: 'none',
              borderRadius: '4px',
              height: '24px',
              width: '46px',
              border: 'none'
            }
          }}>
            <i className="fa fa-share" aria-hidden="true"/>
          </button>
        </div>
        {!replyTo && <div style={{fontSize: 15, marginLeft: 70, color: '#888'}}>
          {typeof total === 'number' ? total : '? '}条评论</div>}
      </div>
    )
  }
}
