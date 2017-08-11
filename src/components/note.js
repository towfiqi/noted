import React from 'react';
import { Editor, Html } from 'slate';
import rules from '../editor-rules';
import ContentEditable from "react-contenteditable";
import {getTime} from '../helpers';
import {base} from '../firebase';
import firebase from 'firebase';

// Create a new serializer instance with our `rules` from above.
const html = new Html({ rules , parseHtml: true});


class Note extends React.Component {

    constructor(){
        super();

        this.state ={note: "", state: html.deserialize("<p>Loading...</p>")};
    }

    state = {
            
            state: html.deserialize("<p>Loading...</p>"),
            // Add a schema with our nodes and marks...
            schema: {
            nodes: {
                code: props => <pre {...props.attributes}>{props.children}</pre>,
                paragraph: props => <p {...props.attributes}>{props.children}</p>,
                quote: props => <blockquote {...props.attributes}>{props.children}</blockquote>,
            },
            marks: {
                bold: props => <strong>{props.children}</strong>,
                italic: props => <em>{props.children}</em>,
                underline: props => <u>{props.children}</u>,
            }
            }
        }

    componentWillMount(){

        //this.setState({state: html.deserialize("<p>Loading...</p>")});
    }

    componentDidMount(){
        const key = this.props.match.params.noteId;
        // const note = db[key];
       const uid = localStorage.getItem('currentOwner');
   
        this.ref = base.syncState(`noted${uid}/notes/${key}`, { context:this, state: 'note', then: ()=> {
            document.title = 'Noted. | ' + this.state.note.title;
            //const ncontent = this.state.note ? html.deserialize(this.state.note.content ): 'Loading...' ;
            this.setState({state: html.deserialize(this.state.note.content)});
        } });

    }

    componentWillUpdate(nextProps, nextState){
        // const localNotes = JSON.parse(localStorage.getItem('notes'));
        // const key = this.props.match.params.noteId;
        // localNotes[key] = nextState;
        // localStorage.setItem('notes', JSON.stringify(localNotes));
    }

    componentWillUnmount(){
        base.removeBinding(this.ref);
    }

    onChange = (state) => {
        this.setState({ state: state, note:{ content: html.serialize(state), last_modified: Date.now() } });

    }

    onDocumentChange = (document, state) => {
        const string = html.serialize(state);
        localStorage.setItem('content', string);
    }

    titleChange = (changed) => {
        this.setState({note:{ title: changed.target.value, last_modified: Date.now() } });
    }


    deleteCat = (key) => {

        const currentnote = {...this.state.note};
        
        //Remove the note's connection from the Category Database
        const uid = localStorage.getItem('currentOwner');
        const catref = firebase.database().ref(`noted${uid}/categories/`);
        const noteid = this.props.match.params.noteId;

        catref.child(`${key}/${noteid}`).once('value').then(function(snap) {
                var data = snap.val();

                if(data  === true){
                    return catref.child(`${key}/${noteid}`).set(null);
                }
        });

        //Then remove the it from the category database
        currentnote.categories[key] = null;
        this.setState({ note: currentnote});
    }

    
    renderCats =()=>{
        if(this.state.note.categories)
        return Object.keys(this.state.note.categories).map( (key)=> {
            return(<span className="note_cat" key={key}>{key} <button className="delete_note_cat" onClick={()=> this.deleteCat(key)}><i className="icon-cancel"/></button></span>);  
        })
    }

    addCat =(e)=> {
        e.preventDefault();
        const key = this.catitle.value;
        const currentnote = {...this.state.note};
        const uid = localStorage.getItem('currentOwner');
        const catref = firebase.database().ref(`noted${uid}/categories/`);
        const noteid = this.props.match.params.noteId;

        catref.child(`${key}/${noteid}`).once('value').then(function(snap) {
            //var data = snap.val();
            return catref.child(`${key}/${noteid}`).set(true);
        });

        //Then add it to the category database
        if(!currentnote.categories){ currentnote.categories = {} }
        currentnote.categories[key] = true;
        this.setState({ note: currentnote});
        this.catForm.reset();
        document.body.querySelector('.show_cat_add_form').classList.remove('cat_add_active');
        this.catForm.classList.remove('show_form');
        //console.log(this.state.note);
    }

    showCatAddForm =(event) =>{
        if(event) {  event.preventDefault();  }
        
        if (this.catForm.classList.contains('show_form')) {
            event.currentTarget.classList.remove('cat_add_active');
            return this.catForm.classList.remove('show_form');
        }else{
            event.currentTarget.classList.add('cat_add_active');
            return this.catForm.classList.add('show_form');
        }

    }

    addCatForm =() =>{

        return(
            <div className="note_add_cat_wrap">
                <button onClick={(event)=>this.showCatAddForm(event)} className="show_cat_add_form"><i className="icon-plus"/></button>
                <form ref={(input)=> this.catForm = input} onSubmit={(e)=>this.addCat(e)} className="add_cat_form">
                    <input ref={(input)=> this.catitle = input}  name="catitle" type="text" placeholder="New Category"/>
                    <button type="submit"><i className="icon-ok"/></button>
                </form>
            </div>
        );
    }

    favNote = () => {

        const note = {...this.state.note};

        if(this.state.note.fav !== true){
                
            note.fav = true;
            this.setState({note: note});
           // console.log(note);
        }else{
            note.fav = null;
            this.setState({note: note});
            //console.log(note);
        }
    }

    render(){
        var modified;
        if(this.state.note.last_modified){
            modified = <span className="modified">Last Modified: {getTime(this.state.note.last_modified, true)}</span>;
        }else{
            modified = '';
        }

        const favicon = this.state.note.fav === true ? <i className="icon-star-filled" onClick={this.favNote} /> : <i className="icon-star" onClick={this.favNote} />;
        return(
            <div className="note">
                <div className="container">

                    {this.renderCats()} {this.addCatForm()}
                    
                    <h2>{favicon}<ContentEditable html={this.state.note.title} onChange={this.titleChange}/></h2>
                    {/* {<div>{this.state.content}</div>} */}
                    <Editor schema={this.state.schema} state={this.state.state} onChange={this.onChange} onDocumentChange={this.onDocumentChange}/>
                </div>
                <div className="footer">
                    <span className="date">Published: {getTime(this.state.note.publish_date, true)}</span>
                    {modified}
                </div>
            </div>
        )
    }
}

export default Note;