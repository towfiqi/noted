import React from 'react';
import {NavLink} from 'react-router-dom';
import firebase from 'firebase';

class Header extends React.Component {
    

  constructor(){
    super();

    this.state = {categories:{}, notescount: 0}
  }

  renderLogout =() =>{

    return(
      <div className="logout">
        <button onClick={this.logout}><i className="icon-power-outline"/> Logout</button>
      </div>
    );

  }

  logout =() =>{

    firebase.auth().signOut().then(function() {
      localStorage.removeItem('currentOwner');
      console.log('Logged Out!');
      window.location.reload();
    }, function(error) {
      console.log(error);
    });
    
  }


  componentDidMount(){

      this.renderSubmenus();

  }

  componentWillReceiveProps(nextProps){
    var location = nextProps.location.pathname;
    if(location.includes('note/note')){
      //console.log('Note Page');
    }
  }

  renderSubmenus =() =>{

    const uid = localStorage.getItem('currentOwner');
    var catref = firebase.database().ref(`noted${uid}/categories/`);
    var notesref = firebase.database().ref(`noted${uid}/notes/`);
    
    //IF /cat/:catName Route, display the respective notes
        var catList = {};
        catref.on("value", (snapshot) =>{
            const data = snapshot.val();
            snapshot.forEach((child) => {
              //create a new array with category: post count  //Ignore the "created:true" item to get the accurate count. 
              catList[child.key] = Object.keys(data[child.key]).filter(function (e) { return e !== 'created';}).length; 
              //console.log(  Object.keys(data[child.key]).filter(function (e) { return e !== 'created';})  );
            });

            this.setState({categories: catList});
        });

        //Get Count of all Notes and save it in the state
        notesref.once("value", (snapshot) =>{
            const data = snapshot.val();
            if(data){
              const count = Object.keys(data).length;

              this.setState({notescount: count});
            }

        });

  }


    render(){

      const allcats = this.state.categories || {};
        return(
            <div className="Header">
                <h1>Noted.</h1>
                <ul className="header-menu">
                    <li><NavLink exact activeClassName="active-menu" to="/">Notes </NavLink>
                      <ul>
                        <li><NavLink exact activeClassName="active-menu" to="/">All <span>{this.state.notescount}</span></NavLink></li>

                        {Object.keys(allcats).map( (key)=> {
                          return( <li key={key}><NavLink exact activeClassName="active-menu" to={`/cat/${key}`}>{key} <span>{allcats[key]}</span></NavLink></li> );
                        })}
                      </ul>

                    </li>
                    <li><NavLink activeClassName="active-menu" to="/categories">Categories </NavLink></li>
                    <li><NavLink activeClassName="active-menu" to="/settings">Settings </NavLink></li>
                </ul>
                {this.renderLogout()}
            </div>
        );
    }
}

export default Header;