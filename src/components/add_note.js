import React from 'react';
import PropTypes from 'prop-types'; 

class AddNote extends React.Component {

    createNote = (e) =>{
        e.preventDefault();
        console.log('Note Added!');

        var categories = {};

        if(this.categories.value){
            
            var catsraw = this.categories.value;
            var cats = catsraw.replace(/\s/g, "");
            const catsArray = cats.split(',');

            catsArray.map((cat)=> {
                //cat = {cat: true}
                console.log(cat);
                return categories[cat] = true;
            })
        }

        const newNote = {
            title: this.title.value,
            slug: this.title.value.replace(/\s+/g, '-').toLowerCase(),
            content: this.content.value,
            categories: categories,
            publish_date: Date.now(),
            last_modified: "",
            Author: ""
        }

        this.props.addNote(newNote);
    }

    onCancelBtnClick = ()=> {
        document.querySelector('.add-note').classList.add('slide-out');
        document.querySelector('.add-note').classList.remove('slide-in');

        
    }

    render(){
        return(
            <div className="add-note">
                <h2>Add Note <button className="cancel_note_button" onClick={this.onCancelBtnClick}>x</button></h2>

                <form ref={(input)=> this.addForm = input} onSubmit={(e)=> this.createNote(e)} className="add-note-form">
                    <input ref={(input)=> this.title = input} type="text" name="title" placeholder="Note Title"/>
                    <textarea ref={(input) => this.content = input} name="content" cols="30" rows="10"></textarea>
                    <input ref={(input) => this.categories = input} type="text" name="categories" placeholder="Note Categories"/>
                    <button type="submit">+ Add Note</button>
                </form>
            </div>
        )
    }
}

AddNote.propTypes = {
    addNote: PropTypes.func,
}

export default AddNote;