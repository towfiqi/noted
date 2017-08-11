import React from 'react';
import AddNote from './add_note';
import {getTime} from '../helpers';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types'; 

class Notes extends React.Component {


    onAddBtnClick = ()=> {
        document.querySelector('.add-note').classList.remove('slide-out');
        document.querySelector('.add-note').classList.add('slide-in');
    }


    render(){
        //First Sort the Notes to display the Favorite Notes or the Current Category Notes in /cat/:catName Route
        var allnotes =  Object.keys(this.props.notes);
        var sortingArr =  this.props.orderedList;

        if(this.props.currentCat){
            allnotes = allnotes.filter(function(a){return ~this.indexOf(a);},sortingArr);
        }else{
            allnotes.sort(function(a, b){  
                return sortingArr.indexOf(a) > sortingArr.indexOf(b) ? 1 : -1;
            });
        }

        const currentCatName = this.props.currentCat ? <span className="cat_title"> / {this.props.currentCat}</span> : '';
        return(
            <div className="container">
                <h2>
                    My Notes {currentCatName}
                    <span className="count">{allnotes.length}</span> 
                    <button className="add_note_button" title="Add New Note" onClick={this.onAddBtnClick}><i className="icon-plus"/></button>
                </h2>
                <div className="notes-list">
                    {allnotes.map( (key)=> {
                        const favicon = this.props.notes[key].fav === true ? <i className="icon-star-filled" onClick={()=>this.props.favNote(key)} /> : <i className="icon-star" onClick={()=>this.props.favNote(key)} />;
                    return(
                        <div className="note-box" key={key}>
                        {favicon}
                            
                        <h3>
                             <Link to={`/note/${key}`}>{this.props.notes[key].title}</Link> 
                             <span className="date">{getTime(this.props.notes[key].publish_date, false)}</span> 
                        </h3>
                        {/* {<p>{this.state.notes[key].content}</p>} */}
                        
                        <button className="delete-note" onClick={()=>this.props.deleteNote(key)} ><i className="icon-trash"/></button>
                    </div>
                    );
                    })}
                </div>

                <AddNote addNote={this.props.addNote} />
            </div>
        );
    }
}

Notes.propTypes = {
    notes: PropTypes.object,
    addNote: PropTypes.func,
    deleteNote: PropTypes.func,
    favNote: PropTypes.func,
    currentCat: PropTypes.string,
    orderedList: PropTypes.array
}


export default Notes;