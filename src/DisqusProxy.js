import React, {Component} from 'react'
import CommentBox from './components/CommentBox'
import CommentList from './components/CommentList'
import Notification from './components/Notification'

export default class DisqusProxy extends Component {
  constructor(props) {
    super(props)
    this.state = {
      comments: [],
      isFetchingComment: true,
      notificationTitle: '',
      notificationBody: '',
      showNotification: false,
      cursor: null,
      more: false,
      loading: false
    }
  }

  componentDidMount() {
    this.checkMore()
  }

  checkMore = () => {
    function getScrollTop() {
      let scrollTop = 0
      if (document.documentElement && document.documentElement.scrollTop) {
        scrollTop = document.documentElement.scrollTop
      }
      else if (document.body) {
        scrollTop = document.body.scrollTop
      }
      return scrollTop
    }

    function getClientHeight() {
      let clientHeight = 0
      if (document.body.clientHeight && document.documentElement.clientHeight) {
        clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight)
      }
      else {
        clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight)
      }
      return clientHeight
    }

    function getScrollHeight() {
      return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    }

    window.onscroll = () => {
      if (getScrollHeight() - getScrollTop() - getClientHeight() < 140) this.loadMore()
    }
  }

  loadMore = async () => {
    const {loading, more} = this.state
    if (!more || loading) return
    await this.getComments()
  }

  getComments = async () => {
    const {cursor, comments} = this.state
    const identifier = window.disqusProxy.identifier
    let query = 'identifier=' + encodeURIComponent(identifier)
    if (cursor) query += '&cursor=' + encodeURIComponent(cursor)
    const url = '//' + window.disqusProxy.server + ':'
      + window.disqusProxy.port.toString() + '/api/getComments'
    this.setState({loading: true})
    try {
      const result = await fetch(url + '?' + query)
      const res = await result.json()
      this.setState({isFetchingComment: false})
      if (res.code === 0) {
        const {cursor, response} = res
        const {more, next} = cursor
        this.setState({more, cursor: next, comments: comments.concat(response)})
      }
      // 错误码 2 是找不到文章的thread，一般为未有评论，故此处忽略之
      else if (res.code !== 2) this.setState({
        notificationTitle: '评论获取错误',
        notificationBody: res.response,
        showNotification: true
      })
    } catch (e) {
      this.setState({
        isFetchingComment: false,
        notificationTitle: '评论获取错误',
        notificationBody: e.message,
        showNotification: true
      })
    }
    this.setState({loading: false})
  }

  async componentWillMount() {
    await this.getComments()
  }

  render() {
    const {notificationTitle, notificationBody, showNotification, comments, isFetchingComment} = this.state
    return (
      <div className="disqus-proxy">
        <div className="disqus-statement">
          您的网络连接在连接
          <a href="https://disqus.com"> disqus.com </a>
          时出现问题, 已为你展示精简版评论系统
        </div>
        <CommentBox/>
        {showNotification && (
          <Notification title={notificationTitle}
                        body={notificationBody}
                        duration={50000}/>
        )}
        <CommentList comments={comments} isLoading={isFetchingComment}/>
      </div>
    )
  }
}
