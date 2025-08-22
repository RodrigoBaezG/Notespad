import { useState } from "react";

function Form({onAddNote}) {

const[title, setTitle] = useState('');
const[description, setDescription] = useState('');

function handleSubmit(e){
    e.preventDefault();
    if (title && description){
        onAddNote({title, description});
        console.log({title, description});
        setTitle('');
        setDescription('');
    }
}
    return ( 
        <div className="form-container">
        <form onSubmit={handleSubmit} className="form-card">
            <label className="label">Title
                <input 
                    className="form-input" 
                    type="text"
                    value={title}
                    required
                    onChange={(e)=>{setTitle(e.target.value)}} />
            </label>
            <label className="label">Description
                <textarea 
                    className="form-input" 
                    id=""
                    value={description}
                    required
                    onChange={(e)=>{setDescription(e.target.value)}}></textarea>
            </label>
            <button type="submit" className="form-button">Add note</button>

        </form>
        </div>
     );
}

export default Form;