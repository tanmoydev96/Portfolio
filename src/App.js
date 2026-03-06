import './App.css';
import About from './components/About/About';
import Header from './components/Header/Header';
import Home from './components/Home/Home';
import Skill from './components/Skills/Skill';
import Qualification from './components/Qualification/Qualification';
import Contact from './components/Contact/contact';
import Projects from './components/Projects/Projects';
function App() {
  return (
    <>
      <Header />
      <main className='main'>
        <Home />
        <About />
        <Skill />
        <Projects />
        <Qualification />
        <Contact />
      </main>
    </>
  )
}

export default App;
