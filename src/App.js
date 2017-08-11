import React, { Component } from 'react';
import Notes from './components/notes';
//import LoadSamples from './sample_notes';
import {base} from './firebase';
import firebase from 'firebase';
import PropTypes from 'prop-types'; 

import './App.css';
import './assets/font/fontello-typicons.css';

class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      notes:{},
      categories: "",
      owner: null,
      ordered:[]
    }
  }


  componentDidMount(){
    
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        //console.log('Signed in user: ', user);

        this.setState({ owner: user.uid });
        const uid = this.state.owner || '';
        this.props.getOwner(uid);
        this.syncref = base.syncState(`noted${uid}/notes`, 
          {
            context:this, 
            state: 'notes', 

          }
        );

        this.sortNotes();

      }
    });


    
  }

  componentWillUnmount(){
    base.removeBinding(this.syncref);
  }

  componentWillReceiveProps(nextProps) {

    if(this.props.match.params.catName !== nextProps.match.params.catName) {
        this.sortNotesByCategory(nextProps.match.params.catName);
    }
} 


  sortNotes = ()=> {

    var noteref = firebase.database().ref(`noted${this.state.owner}/notes/`);
    var sortedKeys = [];
    //IF /cat/:catName Route, display the respective notes
    if(this.props.match.params.catName){
        const cat = this.props.match.params.catName;
        this.sortNotesByCategory(cat);

    }else{
          
          noteref.orderByChild('fav').once("value", (snapshot) => {
              snapshot.forEach(function(child) {
                  sortedKeys.unshift([child.key][0]); 
              });

              return this.setState({  ordered: sortedKeys });
          });
      }

    }

  sortNotesByCategory= (cat) => {
      var noteref = firebase.database().ref(`noted${this.state.owner}/notes/`);
      var sortedKeys = [];
      noteref.orderByChild(`categories/${cat}`).equalTo(true).once("value", (snapshot) => {
          //console.log(snapshot.val());
          snapshot.forEach(function(child) {
              sortedKeys.unshift([child.key][0]); 
          });

          return this.setState({  ordered: sortedKeys });
      });
  }

  addNote = (note)=> {

    const notes = {...this.state.notes};
    const timestamp = Date.now();
    const noteId = `note-${timestamp}`;
    notes[noteId] = note;
    
    this.setState(
      {
        notes: notes
      }
    );

    if(note.categories){
      const uid = this.state.owner || '';
      const noteId = `note-${timestamp}`;
      const catref = firebase.database().ref(`noted${uid}/categories/`);


      Object.keys(note.categories).forEach( function(key, index) {

          catref.child(key).once('value').then(function(snapshot) {
            var catobj = {...snapshot.val()};
              catobj[noteId] = true;
              
              catref.child(key).set( 
                catobj
              );

          });

      });

    }
    this.sortNotes();
    document.querySelector('.add-note').classList.remove('slide-in');
  }

  deleteNote = (key)=> {
  
    if(window.confirm(`Are you sure you want to delete ${this.state.notes[key].title} ?`) === true){
      const notes = {...this.state.notes};
      notes[key] = null;
      this.setState({notes: notes});
    }else{
      return;
    }

    this.sortNotes();
  }


  favNote = (key)=> {
    
      const notes = {...this.state.notes};

      if(notes[key].fav !== true){
        notes[key].fav = true;
        
        this.setState({notes: notes});
        console.log(notes);
      }else{
        notes[key].fav = null;
        this.setState({notes: notes});
      }

      this.sortNotes();
  }



  // authHandler = (err, authData)=> {
  //   console.log();
  // }





  render() {

    return (
      <div className="App">
          
          <Notes notes={this.state.notes} orderedList={this.state.ordered} addNote={this.addNote} deleteNote={this.deleteNote} favNote={this.favNote} currentCat={this.props.match.params.catName} />  

        
      </div>
    );
  }
}

App.propTypes = {
    getOwner: PropTypes.func,
}

export default App;
