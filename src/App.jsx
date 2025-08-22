import List from './components/List.jsx';
import Form from './components/Form.jsx';
import Context from './components/Context.jsx';
import './App.css'


function App() {
  

  return (
    <div className="app-container">
    <Context>
      <Form/>
      <List/>
    </Context>

    </div>
  )
}

export default App
