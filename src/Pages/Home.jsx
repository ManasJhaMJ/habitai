import React, { useState} from 'react';
import { Link } from 'react-router-dom';
import laptopmockup from '../assets/laptop-mockup.png';
import { Book, Bot, Compass, Trophy, Check, Lock, ChevronDown, ChevronUp } from 'lucide-react';

const Home = () => {

    const freeFeatures = [
        'Unlimited Learning Tracks',
        'Basic AI Chatbot Assistance',
        'Progress Tracking',
        'Community Leaderboard Access',
        'Personal Achievement Badges',
        'Basic Habit Insights',
        'Monthly Progress Reports'
      ];
    
      const proFeatures = [
        'Advanced AI Learning Pathways',
        'Personalized Skill Roadmaps',
        'Priority Chatbot Support',
        'Detailed Analytics Dashboard',
        'AI-Powered Weakness Identification',
        'Goal Achievement Prediction',
        'Career Alignment Recommendations',
        'Unlimited Historical Data Tracking'
      ];

      const [activeIndex, setActiveIndex] = useState(null);

      const faqs = [
        {
          question: "How does the AI help me track my learning?",
          answer: "Our AI analyzes your learning patterns, progress, and goals to provide personalized insights. It tracks your activities, identifies strengths and weaknesses, and helps you create more effective learning strategies."
        },
        {
          question: "Is my data private and secure?",
          answer: "Absolutely. We use state-of-the-art encryption and follow strict data protection protocols. Your personal learning information is confidential and will never be shared without your explicit consent."
        },
        {
          question: "Can I use the platform for any type of learning?",
          answer: "Yes! Our platform is designed to be versatile. Whether you're learning a new programming language, studying for an exam, developing a professional skill, or pursuing a personal hobby, our AI can help you track and optimize your learning journey."
        },
        {
          question: "How often are insights and recommendations updated?",
          answer: "Insights are continuously updated in real-time as you log your learning activities. Monthly comprehensive reports provide a deeper analysis of your progress, trends, and suggested improvements."
        },
        {
          question: "Do I need any special tools to get started?",
          answer: "No special tools required. You can access our platform through any web browser on desktop or mobile. Simply create an account, and you're ready to start tracking your learning and personal growth."
        }
      ];
    
      const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
      };

  return (
    <div className="landing-container">
      <section className="hero-section">
        <h1 className="gradient-text">
          Transform Your Potential
          <br />
          with AI-Powered Habits
        </h1>
        <p className="hero-subtitle">
          Unlock your best self through intelligent tracking, learning, and growth
        </p>
        <Link to="/tracker"><button className="cta-button">Get Started</button></Link>
      </section>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <Book className="feature-icon" />
            <h3>Learning Recorder</h3>
            <p>Capture and track your learning journey with intelligent insights</p>
          </div>
          
          <div className="feature-card">
            <Bot className="feature-icon" />
            <h3>Site-Wide Chatbot</h3>
            <p>Your personal AI assistant to guide and motivate your growth</p>
          </div>
          
          <div className="feature-card">
            <Compass className="feature-icon" />
            <h3>Roadmap Generator</h3>
            <p>AI-crafted personalized learning paths tailored to your goals</p>
          </div>
          
          <div className="feature-card">
            <Trophy className="feature-icon" />
            <h3>Leaderboard</h3>
            <p>Track progress, compete, and get motivated by community achievements</p>
          </div>
        </div>
      </section>
      <h2 className='gradient-text section-title'>
        Experience the Future of Habit Management
      </h2>
      <section className="laptop-mockup-section">
      <div className="mockup-container">
        <div className="laptop-border">
          <div className="laptop-screen">
            <img 
              src={laptopmockup} 
              alt="Website Dashboard" 
              className="website-preview"
            />
          </div>
        </div>
      </div>
    </section>
    <section className="pricing-section">
      <div className="pricing-container">
        <h2 className="pricing-title">
          Empowering Your Growth, <br />Your Way
        </h2>
        <p className="pricing-subtitle">
          Choose the plan that fits your learning journey
        </p>
        
        <div className="pricing-grid">
          {/* Free Tier */}
          <div className="pricing-card free-tier">
            <div className="pricing-header">
              <h3>Starter</h3>
              <p className="pricing-cost">Free Forever</p>
            </div>
            
            <ul className="feature-list">
              {freeFeatures.map((feature, index) => (
                <li key={index}>
                  <Check className="feature-icon" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <button className="pricing-button active-button">
              Current Plan
            </button>
          </div>
          
          {/* Pro Tier */}
          <div className="pricing-card pro-tier">
            <div className="pricing-header">
              <h3>Pro</h3>
              <p className="pricing-cost">Coming Soon</p>
            </div>
            
            <ul className="feature-list">
              {proFeatures.map((feature, index) => (
                <li key={index} className="pro-feature">
                  <Lock className="feature-icon locked" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <button className="pricing-button coming-soon-button">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </section>
    <section className="faq-section">
      <div className="faq-container">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <p className="faq-subtitle">Got questions? We've got answers.</p>
        
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <h3>{faq.question}</h3>
                {activeIndex === index ? (
                  <ChevronUp className="faq-icon" />
                ) : (
                  <ChevronDown className="faq-icon" />
                )}
              </div>
              {activeIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
    </div>
  );
};

export default Home;