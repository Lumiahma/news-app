//a Collection for news items
News = new Mongo.Collection("news");

const DRAFT = "draft";
const HIDDEN = "hidden";
const VISIBLE = "visible";

if (Meteor.isClient) {
  // This code is executed on the client only
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY" //don't require emails on account creation (DEMO ONLY)
  });
  
  //subscribes to news items published from server side
  Meteor.subscribe("news");
 
  Meteor.startup(function () {
    // Use Meteor.startup to render the component after the page is ready
    ReactDOM.render(<App />, document.getElementById("render-target"));
  });
}

if(Meteor.isServer){
  //publishes news from the server side (TODO: add account mgmt and default accounts)
  Meteor.publish("news", function(){
    return News.find();
  });
}

Meteor.methods({
  
  insertArticle(author, header, body, tags, status){
    // Make sure the user is logged in before creating an article (TODO: plus is an Admin)
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    
    News.insert({
      author: author,
      header: header,
      body: body,
      tags: tags,
      comments: [],
      status: status,
      createdAt: new Date(), // current time
    });
  
  },
  
  insertComment(article, comment){
    
    News.update(article, {
      $push: {comments: comment}
    });
  },

  insertTag(article, tag){
    
    News.update(article, {
      $push: {tags: {$each: tag}}
    });
  },
  
  changeStatus(article, status){
    // Make sure the user is logged in before changing article status
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    
    News.update(article, {
      $set: {status: status}
    });
  
    console.info("Article status changed");
  },
  
  deleteArticle(article){
  
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    
    News.remove(article);
  },
  
  deleteComment(article, comment){
    
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    
    if(comment){
      News.update(article, {
        $pull: {comments: { _id: comment}}
      });
    }else{
      console.info("This comment has no ID, clear the DB");
    }
  
  },
  
  deleteTag(article, tag){
    // Make sure the user is logged in before deletions (TODO: plus is an Admin)
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
  
  }
  
});