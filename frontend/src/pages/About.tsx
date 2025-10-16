import React from 'react';
import { Users, Target, Award, TrendingUp, Leaf, Heart } from 'lucide-react';

const About: React.FC = () => {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Co-Founder",
      bio: "Former agriculture consultant with 15+ years helping farms optimize their operations and connect with markets.",
      image: "/api/placeholder/200/200"
    },
    {
      name: "Mike Chen",
      role: "CTO & Co-Founder", 
      bio: "AI and machine learning expert specializing in agricultural technology and predictive analytics.",
      image: "/api/placeholder/200/200"
    },
    {
      name: "Dr. Emma Rodriguez",
      role: "Head of AI Research",
      bio: "Agricultural economist and data scientist focused on market prediction models and weather impact analysis.",
      image: "/api/placeholder/200/200"
    },
    {
      name: "David Kim",
      role: "Head of Partnerships",
      bio: "Former farmer and agricultural cooperative leader with deep connections in the farming community.",
      image: "/api/placeholder/200/200"
    }
  ];

  const stats = [
    { icon: Users, label: "Active Farmers", value: "500+" },
    { icon: Leaf, label: "Crops Listed", value: "10,000+" },
    { icon: Heart, label: "Orders Completed", value: "50,000+" },
    { icon: TrendingUp, label: "Revenue Generated", value: "$2M+" }
  ];

  const values = [
    {
      icon: Target,
      title: "Direct Connection",
      description: "We eliminate middlemen to ensure farmers get fair prices and buyers get fresh, quality produce."
    },
    {
      icon: TrendingUp,
      title: "AI-Powered Insights",
      description: "Advanced machine learning helps predict market trends and optimize pricing for everyone."
    },
    {
      icon: Leaf,
      title: "Sustainable Agriculture",
      description: "Supporting farming practices that protect our environment for future generations."
    },
    {
      icon: Heart,
      title: "Community First",
      description: "Building strong relationships between local farmers and their communities."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-farm-green-600 to-farm-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About FarmMarket
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-farm-green-100 max-w-4xl mx-auto">
              Revolutionizing agriculture through technology, connecting local farmers 
              directly with buyers while providing AI-powered market insights.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              To democratize access to fresh, local produce while empowering farmers with 
              the tools and insights they need to thrive in an increasingly complex marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Transforming Agriculture Through Technology
              </h3>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Founded in 2023, FarmMarket emerged from a simple observation: farmers work 
                  incredibly hard to grow quality produce, but often struggle to get fair prices 
                  due to complex supply chains and unpredictable market conditions.
                </p>
                <p className="text-gray-600">
                  By combining direct-to-consumer marketplace technology with advanced AI 
                  predictions, we're creating a more transparent, efficient, and profitable 
                  agricultural ecosystem for everyone involved.
                </p>
                <p className="text-gray-600">
                  Our platform not only connects farmers directly with buyers but also provides 
                  crucial market intelligence, helping farmers make informed decisions about 
                  what to grow, when to harvest, and how to price their products.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-farm-green-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Leaf className="h-24 w-24 text-farm-green-600 mx-auto mb-4" />
                  <p className="text-farm-green-800 font-semibold">Sustainable. Local. Smart.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-lg text-gray-600">
              Building a stronger agricultural community, one connection at a time
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-white p-8 rounded-lg shadow-md">
                    <Icon className="h-12 w-12 text-farm-green-600 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-farm-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-farm-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">
              Passionate individuals working to transform agriculture
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                  <div className="w-24 h-24 bg-farm-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-farm-green-600">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-farm-green-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Technology</h2>
            <p className="text-lg text-gray-600">
              Advanced AI and machine learning powering smarter agriculture
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                AI-Powered Market Intelligence
              </h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-farm-green-100 p-2 rounded-lg mr-4">
                    <TrendingUp className="h-6 w-6 text-farm-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Price Prediction</h4>
                    <p className="text-gray-600">
                      Our machine learning models analyze weather patterns, historical data, 
                      and market trends to predict crop prices up to 30 days in advance.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-farm-green-100 p-2 rounded-lg mr-4">
                    <Award className="h-6 w-6 text-farm-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Market Analysis</h4>
                    <p className="text-gray-600">
                      Real-time analysis of supply levels, demand forecasting, and market 
                      sentiment to help farmers make informed decisions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-farm-green-100 p-2 rounded-lg mr-4">
                    <Leaf className="h-6 w-6 text-farm-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Weather Impact</h4>
                    <p className="text-gray-600">
                      Integration with weather services to assess how environmental 
                      conditions will affect crop quality and market prices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-farm-green-50 to-farm-green-100 p-8 rounded-lg">
              <div className="text-center">
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Service Status</h4>
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-600 font-medium">Operational</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Processing market data in real-time
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-farm-green-600">95%</div>
                    <div className="text-sm text-gray-600">Prediction Accuracy</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-farm-green-600">&lt;1s</div>
                    <div className="text-sm text-gray-600">Response Time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-farm-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join the Agricultural Revolution
          </h2>
          <p className="text-xl mb-8 text-farm-green-100 max-w-2xl mx-auto">
            Whether you're a farmer looking to reach more customers or a buyer 
            seeking fresh, local produce, FarmMarket is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-farm-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Today
            </a>
            <a
              href="/crops"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-farm-green-600 transition-colors"
            >
              Browse Marketplace
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
