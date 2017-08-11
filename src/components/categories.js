import React from 'react';
import {base} from '../firebase';
import firebase from 'firebase';
import omit from 'lodash.omit';

class Categories extends React.Component {

    constructor(){
        super();
        this.state = {
            categories: '',
            owner: ''
        }

        this.editCat = this.editCat.bind(this); 
    }

    componentDidMount(){
    
        firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in.
            this.setState({ owner: user.uid });
            const uid = this.state.owner || '';
            this.ref = base.syncState(`noted${uid}/categories`, {context:this, state: 'categories' });

            //console.log(uid);
        }
        });

  }

    showCatAddForm =(event) =>{


        event.preventDefault();
        if (this.catForm.classList.contains('show_form')) {
            event.currentTarget.classList.remove('cat_add_active');
            return this.catForm.classList.remove('show_form');
        }else{
            event.currentTarget.classList.add('cat_add_active');
            return this.catForm.classList.add('show_form');
        }

    }

    addCategoryForm =() =>{

        return(
            <div className="add_cat_wrap">
                <button onClick={(event)=>this.showCatAddForm(event)} className="show_cat_add_form"><i className="icon-plus"/></button>
                <form ref={(input)=> this.catForm = input} onSubmit={(e)=>this.addCategories(e)} className="add_cat_form">
                    <input ref={(input)=> this.title = input}  name="title" type="text" placeholder="Add Categories"/>
                    <button type="submit"><i className="icon-ok"/></button>
                </form>
            </div>
        );
    }

    addCategories(e){
        e.preventDefault();
        console.log(this.title.value);
        if(this.title.value){
            const categories = {...this.state.categories}
            categories[this.title.value] = {created: true};
            this.setState({categories: categories});
            this.catForm.reset();
        }
    }

    renderCategories=()=>{
        return Object.keys(this.state.categories).map( (key)=> {
            return (
                <div key={key} className="cat-item" id={`cat-${key}`}>
                    <div className="cat-title">{key}</div>
                    <button className="edit_cat" onClick={(event)=>this.editCat(event)}></button>
                    <button className="edit_cat_done"><i className="icon-ok-outline"/></button>
                    <button className="edit_cat_cancel"><i className="icon-cancel-outline"/></button>
                    <button className="delete_cat"><i className="icon-trash"/></button>
                </div>
            );
        });
    }

    editCat(event){

        //console.log('State: ',this.state.categories);
        var target = event.target;
        var parent = target.parentElement;
        var catt = parent.querySelector('.cat-title');
        var catcont = catt.textContent;
        
        const editbtn = target;
        const donbtn = parent.querySelector('.edit_cat_done');
        const cancelbtn = parent.querySelector('.edit_cat_cancel');
        const delete_btn = parent.querySelector('.delete_cat');
            //Style Changes
            catt.setAttribute('contenteditable', true);
            const ebuttons = [donbtn,cancelbtn,delete_btn];

            ebuttons.map((item)=> { return item.classList.add("active-edit-button")});

            editbtn.style.display = 'none';

            catt.focus();
 
            parent.classList.add("active-cat");
  
            [...document.body.querySelectorAll('div.cat-item:not(.active-cat)')].map((item)=> {return item.classList.add("not-active-cat")});

        const uid = this.state.owner || '';
        const noteref = firebase.database().ref(`noted${uid}/notes/`);

        var self = this;


        donbtn.addEventListener('click', function(){
            const currentcats = Object.assign({}, self.state.categories);


            if (catcont !== catt.textContent) {
                //First Edit the Category Database
                Object.defineProperty(currentcats, catt.textContent,
                    Object.getOwnPropertyDescriptor(currentcats, catcont));
                     currentcats[catcont] = null;
                
                self.setState({ categories: currentcats});
                const state = {categories: omit(self.state.categories, currentcats)};
                self.setState(state);

                //Then edit the Posts that contain the categories

                Object.keys(currentcats[catt.textContent]).forEach( function(key, index) {

                    var oldTitle = catcont;
                    var newTitle = catt.textContent;
                    noteref.child(`${key}/categories/`).once('value').then(function(snap) {
                        var data = snap.val();

                        if(data[oldTitle]  !== null){
                            data[oldTitle] = null;
                            data[newTitle] = true;
                            //console.log(data);

                            return noteref.child(`${key}/categories/`).set(data);
                        }
                    });
                });

            }
            //Hide the done and cancel Button and make the div noneditable
            ebuttons.map((item)=> { return item.classList.remove("active-edit-button")});
            editbtn.style.display = 'inline-block';
            catt.setAttribute('contenteditable', false);
            parent.classList.remove("active-cat");
            [...document.body.querySelectorAll('div.cat-item:not(.active-cat)')].map((item)=> {return item.classList.remove("not-active-cat")});
            
        });

        cancelbtn.addEventListener('click', function(){
            catt.textContent = catcont;
            //Hide the done and cancel Button and make the div noneditable
            ebuttons.map((item)=> { return item.classList.remove("active-edit-button")});
            editbtn.style.display = 'inline-block';
            catt.setAttribute('contenteditable', false);
            parent.classList.remove("active-cat");
            [...document.body.querySelectorAll('div.cat-item:not(.active-cat)')].map((item)=> { return item.classList.remove("not-active-cat")});
            
        });

        delete_btn.addEventListener('click', function(){
            const currentcats = {...self.state.categories};
            

                //Then Delete the Posts that contain the categories
                if(typeof currentcats[catcont] === 'object'  ){

                    Object.keys(currentcats[catcont]).forEach( function(key, index) {
                        //console.log(key, index);
                        if(key !== 'created'){
                            var oldTitle = catcont;
                            noteref.child(`${key}/categories/`).once("value", (snapshot) =>{
                                var data = snapshot.val();
                                console.log(data);
                                if(data[oldTitle]  !== null){
                                    data[oldTitle] = null;
                                    console.log(data);
                                    noteref.child(`${key}/categories/`).set(data);
                                }
                            });
                        }

                    });
                }

                //Then remove the it from the category database
                currentcats[catcont] = null;
                self.setState({ categories: currentcats});
                const newstate = {categories: omit(self.state.categories, currentcats)};
                self.setState(newstate);
                [...document.body.querySelectorAll('div.cat-item:not(.active-cat)')].map((item)=> {return item.classList.remove("not-active-cat")});

            console.log(currentcats);
        });
    }

    render(){
        return(
            <div className="container categories-page">
                <h2>Categories</h2>
                {this.addCategoryForm()}
                <div className="cat-list">{this.renderCategories()}</div>
            </div>

        )
    }
}

export default Categories;