NewsItem = React.createClass({
  propTypes: {
    // This component gets the task to display through a React prop.
    // We can use propTypes to indicate it is required
    contents: React.PropTypes.object.isRequired
  },
 
  renderTags(){
      if(this.props.contents.tags){
        return(
          <span className="news-item tags">
            <strong>Tags: </strong>
            {this.props.contents.tags.map((item) => {
              return(
                  <label className="tag-label">{item}</label>
              )
            })}
          </span>
        );
      }
  },
  
  renderBody(){
    let text = this.props.contents.body.split(/\r?\n/g);
    
    return(
      <div className="news-item body">
        {text.map((paragraph) =>{
          return(
            <p>{paragraph}</p>
          );
        })}
      <br /></div>
    );
  },
  
  renderComments(){
        if(this.props.contents.comments){
          
          return(
            <div className="news-item comments">         
            {this.props.contents.comments.map((item) => {
              let comment = item.comment.split(/\r?\n/g);
            
              return (<span className="comment">
                        <h4>By: {item.name} , {this.parseTime(item.createdAt)}</h4>
                        {Meteor.user() ? <button className="delete-button" onClick = {this.deleteComment.bind(this, item._id)}>X</button> : ""}
                        {comment.map((paragraph) => {
                          return(<p>{paragraph}</p>);
                        })}
                        
                        <br />
                      </span>
              );
            })} 
            </div>
          );
        }else{
          return "";
        }
  },
  
  renderStatus(){
      if(Meteor.user() ){
        return(
          <div className="news-status admin-only">
            <label className="control-label">Status: </label>
            <strong>{this.props.contents.status}</strong>
            <span className="status-select">
              <label className="control-label">Change status: </label>
              <select ref="statusSelect" onChange={this.editStatus} >
                <option value="draft">Draft</option>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
            </span>
          </div>
        );
      }
  },
  
  parseTime(time){
   return time.toLocaleString();
  },
  
  //add comments to articles
  addComment(event){
    event.preventDefault();
  
    let comment = {
      _id: this.props.contents.comments ? this.props.contents.comments.length + 1 : 1, 
      name: Meteor.user() ? Meteor.user().username : ReactDOM.findDOMNode(this.refs.commenter).value.trim(), //username or anonymous
      comment: ReactDOM.findDOMNode(this.refs.commentField).value.trim(),
      createdAt: new Date()
    };
    
    Meteor.call("insertComment", this.props.contents._id, comment);
    
    ReactDOM.findDOMNode(this.refs.commentField).value = "";
    console.info("Comment sent");
  },
  
  addTag(event){
    event.preventDefault();
    
    let tagArray = []; 
    
    if(ReactDOM.findDOMNode(this.refs.tagField).value.trim().length >= 1){
      tagArray = ReactDOM.findDOMNode(this.refs.tagField).value.trim().replace(/\s*,\s*/g, ",").split(",");
      Meteor.call("insertTag", this.props.contents._id, tagArray);
    }else{
      //error here
    }
  },
  
  //change the status of the news article (ADMIN Only)
  editStatus(event){
    event.preventDefault();
    
    let status = ReactDOM.findDOMNode(this.refs.statusSelect);
    
    Meteor.call("changeStatus", this.props.contents._id, status.item(status.selectedIndex).value);
  },
  
  //delete a news item (for testing purposes)
  deleteThisItem(event){
    event.preventDefault();
    
    Meteor.call("deleteArticle", this.props.contents._id);
  },
  
  deleteComment(comment, event){
    event.preventDefault();
    
    Meteor.call("deleteComment", this.props.contents._id, comment);
  },
  //copypasted from app.jsx (TODO: find a way to implement client-only global methods?)
  showControls(target, event){
    
    if(ReactDOM.findDOMNode(this.refs[target]).style.display == "block"){
      ReactDOM.findDOMNode(this.refs[target]).style.display = "none";
    }else{
      ReactDOM.findDOMNode(this.refs[target]).style.display = "block";
    }
  },
  
  //render-function can only return ONE DOM element
  render() {
    return (
      <div className="news-item wrapper">
        {this.renderStatus()}
        <h2>{this.props.contents.header}</h2>
        {Meteor.user() ? <button className="delete-button" onClick={this.deleteThisItem}>X</button> : ""}
        <h4>By {this.props.contents.author}, {this.parseTime(this.props.contents.createdAt)}</h4><br />
        <hr className="mid-line" />
        {this.renderBody()}
        {this.renderTags()}
        <button className="control-button tag-button" onClick={this.showControls.bind(this, "tagControls")}>
        <br className="hidden-break" /><img src="img/add-tag-black.svg" />Add tags</button>
        <span className="add-tag" ref="tagControls">
          <input type="text" ref="tagField" placeholder="Add tags here (separate tags by commas)" /><button className="control-button" onClick={this.addTag}>Submit</button>
        </span><br />
        <br /><br /><strong>Comments: {this.props.contents.comments ? this.props.contents.comments.length : 0}</strong>
        {this.renderComments()}
        <button className="control-button" onClick={this.showControls.bind(this,"commentControls")}>Add a comment...</button><br /> 
        <span className="add-comment" ref="commentControls">
          {!Meteor.user() ? <input type="text" ref="commenter" placeholder="Your name here..." /> : ""}
          <br /><textarea rows="6" cols="50" ref="commentField" placeholder="Your comments here..." /><br />
          <button type="submit control-button" className="control-button" onClick={this.addComment}>Submit</button>
        </span><br />
	  </div>
    );
  }
});