# AI-Powered Digital Wellness Monitoring System

This application includes an advanced AI-powered wellness monitoring system that provides real-time detection of employee overwork patterns and automated health interventions.

## 🧠 AI Wellness Features

### Employee Dashboard (/dashboard)
- **Smart Activity Monitoring**: Invisible background tracking of keyboard/mouse activity
- **AI Usage Detection**: TensorFlow.js model analyzes patterns to detect overwork
- **Real-time Wellness Score**: Live wellness assessment with confidence indicators
- **Automated Break Reminders**: Smart notifications when breaks are needed
- **Break Tracking**: Daily screen time and break compliance monitoring
- **Emergency Escalation**: Critical fatigue detection with doctor alerts

### Doctor Dashboard (/doctor)
- **Wellness Alerts Feed**: Real-time notifications of employee health risks
- **Critical Fatigue Alerts**: Immediate notifications for extreme cases
- **Employee Wellness History**: Aggregated AI-driven usage reports
- **Alert Management**: Review and resolve wellness concerns
- **Analytics Dashboard**: Trends and patterns across employee base

### IT Team Dashboard (/it-team)
- **Threshold Configuration**: Customize wellness monitoring parameters
- **Department Controls**: Enable/disable monitoring by department
- **Model Management**: Upload and version AI models
- **System Health Monitoring**: Real-time system status
- **Data Export**: Configuration and analytics export tools

## 🤖 AI/ML Implementation

### Local Activity Tracking
- Browser-based keystroke and mouse monitoring (privacy-first)
- Anonymized activity aggregation (no content logging)
- 5-minute interval data collection
- Firestore sync for summary events only

### Machine Learning Model
- **Type**: Time-series LSTM classification model
- **Features**: Keystroke frequency, mouse activity patterns, temporal data
- **Deployment**: TensorFlow.js for browser inference (privacy-preserving)
- **Training**: Python script with synthetic + anonymized company data
- **Updates**: Hot-swappable models via IT dashboard

### Real-time Processing
- Client-side inference (no data leaves device for AI processing)
- Firestore listeners for instant dashboard updates
- Progressive enhancement (works without AI if model fails)

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- Python 3.8+ (for model training)
- Firebase project with Firestore enabled

### Quick Start
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup AI Wellness System**:
   ```bash
   python setup_wellness_ai.py
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

### Manual Setup (Alternative)
If the automated setup fails, run these commands manually:

```bash
# Install Python dependencies
pip install tensorflow numpy tensorflowjs

# Train the AI model
python src/lib/model_training.py

# Start the app
npm run dev
```

## 📊 Wellness Monitoring Configuration

### Default Thresholds
- **Max Continuous Activity**: 90 minutes
- **Break Reminder Interval**: 30 minutes  
- **Critical Fatigue Threshold**: 0.8 confidence
- **Alert Cooldown**: 30 minutes between alerts

### Customization
IT admins can adjust these values via the IT Team Dashboard:
- Department-specific monitoring
- Custom activity thresholds
- Alert frequency controls
- Model version management

## 🔒 Privacy & Security

### Data Protection
- **Local Processing**: AI inference happens in browser
- **Anonymized Data**: Only aggregated metrics stored
- **No Content Logging**: Keystrokes tracked by frequency, not content
- **Minimal Storage**: Summary events only, raw data stays local

### Compliance Features
- GDPR-compliant data handling
- Employee consent management
- Data retention controls
- Audit logging for all wellness events

## 🚀 Advanced Features

### Emergency Escalation System
```typescript
// Automatic escalation for critical cases
if (fatigueLevel > criticalThreshold) {
  await alertDoctor({
    userId,
    riskLevel: 'critical',
    confidence: aiConfidence,
    recommendedAction: 'immediate_break'
  });
}
```

### Predictive Analytics
- Historical pattern analysis
- Risk trend identification
- Personalized baseline learning
- Department-wide insights

### Integration Points
- **Calendar Integration**: Meeting-aware break scheduling
- **Slack/Teams**: Wellness status sharing
- **HR Systems**: Wellness compliance reporting
- **Health Apps**: Fitness tracker integration

## 📈 Monitoring & Analytics

### Key Metrics
- Employee wellness scores
- Break compliance rates
- Critical alert frequency
- Department health trends
- Model performance metrics

### Dashboards
- **Real-time**: Live monitoring of active sessions
- **Historical**: Trends and patterns over time
- **Comparative**: Department and individual comparisons
- **Predictive**: Risk forecasting and prevention

## 🛠️ Technical Architecture

### Frontend Stack
- **Next.js 14**: React framework with App Router
- **TensorFlow.js**: Client-side AI inference
- **Firebase**: Real-time database and auth
- **Tailwind CSS**: Styling and components
- **TypeScript**: Type safety

### Backend Services
- **Firestore**: Real-time data sync
- **Firebase Auth**: User authentication
- **Cloud Functions**: Server-side processing (optional)
- **Firebase Hosting**: Static site deployment

### AI Pipeline
```
Activity Data → Preprocessing → LSTM Model → Risk Assessment → Alert System
     ↓              ↓              ↓              ↓              ↓
  Browser       TensorFlow.js   Local Inference  Firestore    Real-time UI
```

## 🎯 Future Enhancements

### Planned Features
- **Voice Pattern Analysis**: Stress detection via microphone (opt-in)
- **Computer Vision**: Posture monitoring via webcam
- **Biometric Integration**: Heart rate and stress sensors
- **ML Model Improvements**: More sophisticated fatigue detection
- **Mobile App**: Companion app for break reminders

### Integrations Roadmap
- Microsoft 365 integration
- Slack wellness bot
- Apple HealthKit/Google Fit
- Ergonomic device APIs
- Corporate wellness platforms

## 📝 Usage Examples

### For Employees
```typescript
// Automatic wellness monitoring starts when dashboard loads
const { wellnessState } = useActivityMonitor(userId);

// Manual break logging
const takeBreak = () => {
  logManualBreak(userId);
  showBreakExercises();
};
```

### For Doctors
```typescript
// Real-time wellness alerts
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, 'doctor_alerts')),
    (alerts) => showCriticalAlerts(alerts)
  );
}, []);
```

### For IT Admins
```typescript
// Configure department monitoring
const updateDepartmentConfig = async (dept, enabled) => {
  await updateDoc(doc(db, 'wellness_config'), {
    [`departments.${dept}.enabled`]: enabled
  });
};
```

## 🆘 Troubleshooting

### Common Issues
1. **AI Model Not Loading**: Check browser console, ensure TensorFlow.js is installed
2. **Activity Not Detected**: Verify browser permissions for keyboard/mouse events
3. **Alerts Not Showing**: Check Firestore connection and user permissions
4. **Model Training Fails**: Ensure Python dependencies are installed correctly

### Debug Mode
Enable detailed logging:
```javascript
// Add to your component
const DEBUG_MODE = process.env.NODE_ENV === 'development';
if (DEBUG_MODE) console.log('Wellness state:', wellnessState);
```

## 📞 Support

For technical support or feature requests, please contact:
- IT Team Dashboard: Configure system settings
- GitHub Issues: Report bugs and request features  
- Documentation: Additional setup guides

---

**⚡ The AI-powered wellness system is now active!** Employee dashboards will automatically begin monitoring wellness patterns and providing intelligent break recommendations.
