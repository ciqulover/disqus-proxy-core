import React, {Component} from 'react'
import CommentBox from './CommentBox'

const styles = {
  span: {
    display: 'inline-block',
    marginRight: 10,
  }
}

const getAvatar = (author) => {

  const image = author.avatar.cache || author.avatar.large.cache

  if (image.indexOf('noavatar') === -1) return image

  const getColor = (key) => {
    const keys = [...key]
    const hash = keys.reduce((pre, cur) => pre + cur.charCodeAt(0), 0)
    return `rgb(${hash % 255}, ${hash % 245}, ${hash % 235})`
  }

  return window.blockies.create({
    seed: author.name,
    color: getColor(author.name + 'color'),
    bgcolor: getColor(author.name + 'bgcolor'),
    spotcolor: getColor(author.name + 'spotcolor')
  }).toDataURL()
}

class Comment extends Component {

  constructor(props) {
    super(props)
    this.state = {
      replyTo: null
    }
  }


  showReply = (parentId) => {
    const {replyTo} = this.state
    if (replyTo) return this.setState({replyTo: null})
    this.setState({replyTo: parentId})
  }

  render() {
    const {author, createdAt, message, points, dislikes, id} = this.props.comment
    const {replyTo} = this.state
    return (
      <div style={{padding: '0 10px'}}>
        <div style={{display: 'inline-block'}}>
          <img src={getAvatar(author)}
               style={{
                 width: 40,
                 height: 40,
                 borderRadius: '50%',
                 boxShadow: ' 1px 1px 3px 0.5px #ccc'
               }}
               alt="avatar"/>
        </div>
        <div style={{margin: '-60px 0 0 60px'}}>
          <p className="comment-header">
          <span style={{...styles.span, color: '#888', fontSize: 14}}>
            {author.name}
          </span>
            {this.props.isPrimary && (
              <span style={{
                ...styles.span,
                boxSizing: 'border-box',
                lineHeight: '16px',
                fontSize: 12,
                backgroundColor: '#aaa',
                color: 'white',
                padding: '0 3px',
                borderRadius: 4
              }}>
              Admin
            </span>
            )}
            {this.props.replyTo && (
              <span style={{...styles.span, color: '#888', fontSize: 14}}>
              <i className="fa fa-share"
                 style={{
                   color: '#42b983',
                   display: 'inline-block',
                   marginRight: 10
                 }}/>
                {this.props.replyTo}
            </span>)}
            <span style={{
              ...styles.span,
              color: '#bbb',
              fontSize: 12,
              fontFamily: "'calligraffittiregular', sans-serif"
            }}>
            {(new Date(+new Date(createdAt) + 1000 * 60 * 60 * 8)).toLocaleString()}
          </span>
          </p>
          <p className="comment-body"
             style={{fontSize: 14, color: '#34495e', marginBottom: 0}}
             dangerouslySetInnerHTML={{__html: message}}>
          </p>
          <div style={{fontSize: 12}}>
            <i className="fa fa-thumbs-up"
               style={{
                 display: 'inline-block',
                 color: '#42b983',
                 marginRight: 10
               }}/>
            {points}
            <i className="fa fa-thumbs-down"
               style={{
                 marginLeft: 10,
                 color: '#ff974d',
                 display: 'inline-block',
                 marginRight: 10
               }}/>
            {dislikes}
            <p style={{display: 'inline-block'}}>
              <a style={{
                color: '#42b983',
                textDecoration: 'none',
                cursor: 'pointer',
                marginLeft: 10
              }}
                 onClick={() => this.showReply(id)}>
                {/*<i className="fa fa-reply"*/}
                {/*style={{*/}
                {/*color: '#42b983',*/}
                {/*}}/>*/}
                回复
              </a>
            </p>
            {replyTo === id && <CommentBox replyTo={id}/>}
          </div>
        </div>
        {this.props.children && this.props.children.length > 0 && (
          <ul className="post-reply">
            {this.props.children.map(discuss => {
              return (
                <li key={discuss.comment.id}>
                  <Comment comment={discuss.comment}
                           author={discuss.author}
                           isPrimary={discuss.isPrimary}
                           replyTo={this.props.author}
                           children={discuss.children}/>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }

}


export default Comment
