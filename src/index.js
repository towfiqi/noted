import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Header from './components/header';
import Categories from './components/categories';
import Settings from './components/settings';
import Note from './components/note';
import Splash from './components/splash';
import registerServiceWorker from './registerServiceWorker';
import {BrowserRouter as Router,Route } from 'react-router-dom';

class Root extends React.Component {

    constructor(){
        super();

        this.state= {owner: localStorage.getItem('currentOwner')}
        this.getOwner = this.getOwner.bind(this);
    }

    getOwner(owner){
        this.setState({owner: owner});
    }


    render(){
        const isLoggedIn = this.state.owner ? true : false;
        return(
            <Router>

                {isLoggedIn ? (
                    <div>
                        {/* <Header /> */}
                        <Route  path="/" component={Header} />
                        <Route exact path="/" render={props => <App getOwner={this.getOwner} {...props} />}/>
                        <Route exact path="/cat/:catName" render={props => <App getOwner={this.getOwner} {...props} />}/>
                        <Route exact path="/categories" component={Categories} />
                        <Route exact path="/settings" component={Settings} />
                        <Route exact path="/note/:noteId" component={Note}/>
                    </div>
                ) : (
                    <Route exact path="/" render={props => <Splash getOwner={this.getOwner} {...props} />}/>
                )}
                
            </Router>
            );
    }
}



ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
