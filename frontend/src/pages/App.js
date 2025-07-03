import '../css/App.css';
import TopBar from '../componenets/TopBar';
import TopBackground from '../assets/TopBackground.jpg';  //change immage asset link if needed

function App() {
  return (
    <div className="app">
      <div className="top-background">
        <img src={TopBackground} alt="Top Background" />
      </div>
      <TopBar />
    </div>
  );
}

export default App;