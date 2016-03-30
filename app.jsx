// App component - represents the whole app
App = React.createClass({

  // This mixin makes the getMeteorData method work
  mixins: [ReactMeteorData],
  //sets the initial state of the application
  getInitialState(){
    return {
      filter: "",
      value: "",
    }
  },
  
  // Loads items from the News collection and puts them on this.data.news, sort by creation time
  getMeteorData() {
    let query = {};
    let field = this.state.filter;
    let value = this.state.value.trim();
 
    if(field != "" && value != ""){
      //use a regular expression for inclusive searches (TODO: add alternatives for exact searches)
      query[field] =  new RegExp(value, "i");
    }

    //filters out all non-visible articles if not logged in
    if(!Meteor.user()){
      query["status"] = "visible";
    }
  
    return {
      news: News.find(query, {sort: {createdAt: -1}}).fetch(),
      state: this.getInitialState(),
      user: Meteor.user()
    }
  },
  
  renderNewsItems() {
    return this.data.news.map((news) => {
      return <NewsItem key={news._id} contents={news} />;
    });
  },
  
  //submit a news article (no comments or tags yet)
  submitNews(event){

    event.preventDefault();
    
    let author = Meteor.user().username || "Admin";
    let header = ReactDOM.findDOMNode(this.refs.headLine).value.trim() || "Dummy";
    let body = ReactDOM.findDOMNode(this.refs.newsBody).value.trim() || "Dummy 2";
    let tags = [];
    let status = "draft";
    
    if(ReactDOM.findDOMNode(this.refs.tags).value.trim().length >= 1){
      tags = ReactDOM.findDOMNode(this.refs.tags).value.trim().replace(/\s*,\s*/g, ",").split(",");
    }
    
    Meteor.call("insertArticle", author, header, body, tags, status);

    //empty form
    ReactDOM.findDOMNode(this.refs.headLine).value = "";
    ReactDOM.findDOMNode(this.refs.newsBody).value = "";
    ReactDOM.findDOMNode(this.refs.tags).value = "";
  },
  
  filterNews(event){
    event.preventDefault();
    
    let filter = ReactDOM.findDOMNode(this.refs.filterBy);
    let value = ReactDOM.findDOMNode(this.refs.filterValue).value.trim() || "";
    
    //add a check here for valid content
    this.setState({
      filter: filter.item(filter.selectedIndex).value,
      value: value
    });
    
    ReactDOM.findDOMNode(this.refs.filterValue).value = "";  
  },
  
  searchNews(event){
    event.preventDefault();
    
    this.setState({
      filter: "header",
      value: ReactDOM.findDOMNode(this.refs.searchValue).value.trim() || ""
    });

    ReactDOM.findDOMNode(this.refs.searchValue).value = "";
  },
  
  sortNews(event){
    event.preventDefault();
    
  },
  
  showAll(event){
    event.preventDefault();
    
    this.setState({
      filter: "",
      value: "",
    });
  },
  
  showControls(target, event){
    
    //TODO: Add a CSS rule for opened control spans

    if(ReactDOM.findDOMNode(this.refs[target]).style.display == "inline"){
      ReactDOM.findDOMNode(this.refs[target]).style.display = "none";
    }else{
      ReactDOM.findDOMNode(this.refs[target]).style.display = "inline";
    }
  },
  
  render() {
    return (
      <div className="container">
        <header>
        
          <AccountsUIWrapper />
          
          <label className="app-header">SPA NEWS</label>
          
          <div className="news-controls">
          
            {this.data.user ? 
            <button className="control-button search-open" onClick={this.showControls.bind(this, "addNews")} ><label>Add News</label></button> : ""}
            {this.data.user ?
            <span className="add-news" ref="addNews" >
              <h3>Add a news article (admin testing only ATM)</h3>
              <input type="text" ref="headLine" placeholder="News Headline Here" /><br />
              <textarea rows="8" cols="40" ref="newsBody" placeholder="News text here" /><br />
              <input type="text" className="tag-input" ref="tags" placeholder="Add tags (Tag 1, Tag 2...)" />
              <button className="control-button" onClick = {this.submitNews} >Submit</button><br />
            <hr /></span> : ""}
            
            <button className="control-button filter-open" onClick={this.showControls.bind(this, "filterControls")} >Filter news</button>
            <span className="filter-controls" ref="filterControls">  
              <br className="hidden-break" />
              
              {this.data.user ?
              <select ref="filterBy">
                <option value="tags">By tag(s)</option>
                <option value="author">By author</option>
                <option value="status">By status</option>
              </select>
              :
              <select ref="filterBy">
                <option value="tags">By tag(s)</option>
                <option value="author">By author</option>
              </select>
              }
            
              <input type="text" ref="filterValue" placeholder="Filter value here..." />
              <button className="control-button submit-button" onClick = {this.filterNews} >Submit</button>
            </span>
            
            <button className="control-button" onClick={this.showControls.bind(this, "searchControls")}>Search news</button>
            <span className="search-controls" ref="searchControls">
              <br className="hidden-break" />
              <input type="text" ref="searchValue" placeholder="Search terms here..." />
              <button className="control-button submit-button" onClick ={this.searchNews} >Submit</button>
            </span>
            
            
          </div>
          
          {this.state.filter !== "" ? 
            <div className="filter-modal">
              <hr />
              <label className="filterLabel" ref="filterLabel">Filtering by: {this.state.filter}, {this.state.value}</label>
              <button className="show-all control-button" onClick= {this.showAll} >Clear filter</button>
            </div>
          : ""}

        </header>
        
        <div className="news-feed-container">
          <br />
          {this.renderNewsItems()}
          <br />
        </div>
      </div>
    );
  }
});