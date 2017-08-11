import React from 'react';
import {base} from '../firebase';
import firebase from 'firebase';

class Settings extends React.Component {

    constructor(){

        super();

        this.state = {settings: ''}

        // this.email = this.state.settings.email;
        // this.country = this.state.settings.country;
        
    }

  componentDidMount(){
    
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        //console.log('Signed in user: ', user);

        this.setState({ owner: user.uid });
        const uid = this.state.owner || '';
        this.ref = base.syncState(`noted${uid}/settings`, {context:this, state: 'settings' });
        

        const settingsref = firebase.database().ref(`noted${uid}/settings/`);
        settingsref.once('value').then((snapshot) => {
            const data = snapshot.val();
            console.log(data.name);
            this.setState({settings: data})

            this.name.value = this.state.settings.name ? this.state.settings.name : '';
            this.email.value = this.state.settings.email ? this.state.settings.email : '';
            this.country.value = this.state.settings.country ? this.state.settings.country : '';
        });

      }
    });

  }

  saveSettings = (e) => {
    e.preventDefault();

    const newSettings = {name: this.name.value, email: this.email.value, country: this.country.value}

    this.setState({settings: newSettings});

  }


  renderSettingsForm =() =>{

    return(
        <form ref={(input) => this.settingsForm = input} className="settingsForm" onSubmit={(e)=> this.saveSettings(e)}>
            <input ref={(input) => this.name = input} type="text" placeholder="Your Name" />
            <input ref={(input) => this.email = input} type="text" placeholder="Your Email" />
            <input ref={(input) => this.country = input} type="text" placeholder="Your Country" />
            <button type="submit">Submit</button>
        </form>
    );
  }

    render(){
        return(
            <div className="container">
                <h2>Settings</h2>
                {this.renderSettingsForm()}
            </div>
        )
    }
}

export default Settings;