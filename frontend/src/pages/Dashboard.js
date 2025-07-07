import '../css/App.css';
import '../css/Dashboard.css';

import feedbackIcon from '../assets/dashboard_images/feedback.webp'
import ticketIcon from '../assets/dashboard_images/ticket.webp'
import directoryIcon from '../assets/dashboard_images/directory.webp'
import leaveIcon from '../assets/dashboard_images/leave.webp'
import Calendar from '../components/Calendar.js';

function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="profile-section">Profile</div>
      <div className="announcements">Announcements</div>
      <div className="team-resources">
        <div className = 'titles'>Team Resources</div>
          <button className = "team-resources-buttons">
              <img src={ticketIcon} className="icon"/> 
              Contact HR
          </button>
        <button className = "team-resources-buttons"> <img src={ticketIcon} className="icon" /> 
        Contact IT</button>
        <button className = "team-resources-buttons"> <img src={feedbackIcon} className="icon" /> 
        Report Feedback</button>
        <button className = "team-resources-buttons"> <img src={directoryIcon} className="icon" /> 
        Directory</button>
        <button className = "team-resources-buttons"> <img src={leaveIcon} className="icon" /> 
        Request Leave</button>
        <button className = "team-resources-buttons"> 
        </button>
        </div>
      <div className="calendar">
        <Calendar />
      </div>
    </div>
  );
}

export default Dashboard;