import React from 'react';
import {auth} from '../firebase';
import firebase from 'firebase';
import PropTypes from 'prop-types'; 

class Splash extends React.Component {

  componentWillMount(){
    
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const uid = user.uid || '';
        this.props.getOwner(uid);
      }
    });
    
  }

    authenticate= (provider) =>{
        if(provider === 'facebook'){
        provider = new firebase.auth.FacebookAuthProvider();
        }else if(provider === 'twitter'){
        provider = new firebase.auth.TwitterAuthProvider();
        }else if(provider === 'google'){
        provider = new firebase.auth.GoogleAuthProvider();
        }

        auth.signInWithPopup(provider).then((result) => {

        this.props.getOwner(result.user.uid);
        localStorage.setItem('currentOwner', result.user.uid);
        const userdb = firebase.database().ref(`noted${result.user.uid}`);

        userdb.once('value', (snapshot)=> {
            const data = snapshot.val() || {};

            if(!data.owner && !data.settings){
                userdb.set({owner: result.user.uid, settings: {name:result.user.displayName}});
            }

        });


        }).catch(function(error) {
            // An error occurred
            console.log('Authentication Error: ',error);
        });

    }

    renderLogin =() =>{
        return(
        <div className="renderLogin">
            <h2>Noted.</h2>

            <button className="facebook" onClick={()=> this.authenticate('facebook')}><i className="icon-facebook"/> Login with Facebook</button>
            <button className="twitter" onClick={()=> this.authenticate('twitter')}><i className="icon-twitter"/> Login with Twitter</button>
            <button className="google" onClick={()=> this.authenticate('google')}><i className="icon-google"/> Login with Google</button>
        </div>
        )
    }

    render(){
        return(
            <div className="Splash">
                {this.renderLogin()}
            </div>
        );
    }
}

Splash.propTypes = {
    getOwner: PropTypes.func,
}

export default Splash;