import './App.css';
import About from './components/About/About';
import Header from './components/Header/Header';
import Home from './components/Home/Home';
import Skill from './components/Skills/Skill';
import Qualification from './Qualification/Qualification';
function App() {
  return (
    <>
      <Header />
      <main className='main'>
        <Home />
        <About />
        <Skill />
        <Qualification />
      </main>
    </>
  )
}

export default App;
