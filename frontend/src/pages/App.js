import '../css/App.css';
import TopBar from '../components/TopBar';
import TopBackground from '../assets/TopBackground.jpg';  //change immage asset link if needed
import Dashboard from './Dashboard';

function App() {
  return (
    <div className="app">
      <div className="top-background">
        <img src={TopBackground} alt="Top Background" />
      </div>
      <TopBar />

      <section id="dashboard">
        <Dashboard />
      </section>
    </div>
  );
}

export default App;