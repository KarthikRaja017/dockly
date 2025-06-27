// import React, { useState, useEffect } from 'react';
// import { Brain, TrendingUp, Lightbulb, Target, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react';

// const SmartInsights: React.FC = () => {
//   const [insights, setInsights] = useState([
//     {
//       id: 1,
//       type: 'productivity',
//       icon: <Brain size={18} />,
//       title: 'Peak Performance Window',
//       description: 'Your productivity peaks between 10-11 AM. Schedule important tasks during this time.',
//       confidence: 92,
//       action: 'Optimize Schedule',
//       bgColor: '#eff6ff',
//       borderColor: '#bfdbfe',
//       textColor: '#1e40af',
//       actionColor: '#2563eb'
//     },
//     {
//       id: 2,
//       type: 'financial',
//       icon: <TrendingUp size={18} />,
//       title: 'Spending Pattern Alert',
//       description: 'Coffee expenses increased 40% this month. Consider a subscription plan.',
//       confidence: 87,
//       action: 'View Options',
//       bgColor: '#f0fdf4',
//       borderColor: '#bbf7d0',
//       textColor: '#166534',
//       actionColor: '#16a34a'
//     },
//     {
//       id: 3,
//       type: 'health',
//       icon: <Target size={18} />,
//       title: 'Activity Goal Insight',
//       description: 'You\'re 23% more active on days when you sleep 7+ hours.',
//       confidence: 89,
//       action: 'Sleep Better',
//       bgColor: '#fef2f2',
//       borderColor: '#fecaca',
//       textColor: '#991b1b',
//       actionColor: '#dc2626'
//     },
//     {
//       id: 4,
//       type: 'automation',
//       icon: <Zap size={18} />,
//       title: 'Automation Opportunity',
//       description: 'Auto-categorize recurring transactions to save 15 minutes weekly.',
//       confidence: 95,
//       action: 'Set Up',
//       bgColor: '#faf5ff',
//       borderColor: '#e9d5ff',
//       textColor: '#7c2d12',
//       actionColor: '#8b5cf6'
//     }
//   ]);

//   const [selectedInsight, setSelectedInsight] = useState(0);
//   const [isProcessing, setIsProcessing] = useState(false);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIsProcessing(true);
//       setTimeout(() => {
//         setIsProcessing(false);
//       }, 2000);
//     }, 30000);

//     return () => clearInterval(interval);
//   }, []);

//   const getConfidenceColor = (confidence: number) => {
//     if (confidence >= 90) return '#10b981';
//     if (confidence >= 80) return '#f59e0b';
//     return '#ef4444';
//   };

//   return (
//     <div style={{
//       backgroundColor: 'white',
//       borderRadius: '20px',
//       border: '1px solid #e2e8f0',
//       marginBottom: '24px',
//       overflow: 'hidden',
//       opacity: 0,
//       animation: 'fadeInUp 0.6s ease-out 0.5s forwards'
//     }}>
//       <div style={{
//         padding: '20px 24px',
//         borderBottom: '1px solid #f1f5f9',
//         background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
//       }}>
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//             <Brain size={20} style={{ color: '#8b5cf6' }} />
//             <h3 style={{
//               fontSize: '18px',
//               fontWeight: '600',
//               color: '#1e293b',
//               margin: 0
//             }}>
//               Smart Insights
//             </h3>
//           </div>
//           <div style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '6px',
//             padding: '4px 8px',
//             backgroundColor: isProcessing ? '#fef3c7' : '#f0fdf4',
//             borderRadius: '12px'
//           }}>
//             <div style={{
//               width: '6px',
//               height: '6px',
//               backgroundColor: isProcessing ? '#f59e0b' : '#10b981',
//               borderRadius: '50%',
//               animation: isProcessing ? 'pulse 1s infinite' : 'none'
//             }} />
//             <span style={{
//               fontSize: '12px',
//               color: isProcessing ? '#92400e' : '#16a34a',
//               fontWeight: '500'
//             }}>
//               {isProcessing ? 'Analyzing' : 'AI Active'}
//             </span>
//           </div>
//         </div>
//       </div>

//       <div style={{ padding: '24px' }}>
//         {/* Featured Insight */}
//         <div style={{
//           padding: '20px',
//           backgroundColor: insights[selectedInsight].bgColor,
//           border: `1px solid ${insights[selectedInsight].borderColor}`,
//           borderRadius: '16px',
//           marginBottom: '20px',
//           position: 'relative',
//           overflow: 'hidden'
//         }}>
//           <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
//             <div style={{
//               color: insights[selectedInsight].actionColor,
//               backgroundColor: 'rgba(255, 255, 255, 0.8)',
//               padding: '10px',
//               borderRadius: '12px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}>
//               {insights[selectedInsight].icon}
//             </div>

//             <div style={{ flex: 1 }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
//                 <h4 style={{
//                   fontSize: '16px',
//                   fontWeight: '600',
//                   color: insights[selectedInsight].textColor,
//                   margin: 0
//                 }}>
//                   {insights[selectedInsight].title}
//                 </h4>
//                 <div style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '4px',
//                   padding: '2px 6px',
//                   backgroundColor: 'rgba(255, 255, 255, 0.7)',
//                   borderRadius: '6px'
//                 }}>
//                   <div style={{
//                     width: '4px',
//                     height: '4px',
//                     backgroundColor: getConfidenceColor(insights[selectedInsight].confidence),
//                     borderRadius: '50%'
//                   }} />
//                   <span style={{
//                     fontSize: '10px',
//                     fontWeight: '500',
//                     color: insights[selectedInsight].textColor
//                   }}>
//                     {insights[selectedInsight].confidence}% confident
//                   </span>
//                 </div>
//               </div>

//               <p style={{
//                 fontSize: '14px',
//                 color: insights[selectedInsight].textColor,
//                 opacity: 0.9,
//                 margin: '0 0 16px 0',
//                 lineHeight: '1.4'
//               }}>
//                 {insights[selectedInsight].description}
//               </p>

//               <div style={{ display: 'flex', gap: '8px' }}>
//                 <button style={{
//                   fontSize: '13px',
//                   color: insights[selectedInsight].actionColor,
//                   backgroundColor: 'rgba(255, 255, 255, 0.9)',
//                   border: 'none',
//                   padding: '8px 16px',
//                   borderRadius: '8px',
//                   fontWeight: '600',
//                   cursor: 'pointer',
//                   transition: 'all 0.2s ease',
//                   boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
//                 }}>
//                   {insights[selectedInsight].action} →
//                 </button>
//                 <button style={{
//                   fontSize: '13px',
//                   color: insights[selectedInsight].textColor,
//                   backgroundColor: 'transparent',
//                   border: `1px solid ${insights[selectedInsight].borderColor}`,
//                   padding: '8px 16px',
//                   borderRadius: '8px',
//                   fontWeight: '500',
//                   cursor: 'pointer',
//                   transition: 'all 0.2s ease'
//                 }}>
//                   Learn More
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Animated background pattern */}
//           <div style={{
//             position: 'absolute',
//             top: '-30%',
//             right: '-30%',
//             width: '150%',
//             height: '150%',
//             background: `radial-gradient(circle, ${insights[selectedInsight].actionColor}10 0%, transparent 70%)`,
//             transform: 'rotate(45deg)',
//             opacity: 0.5
//           }} />
//         </div>

//         {/* Insight Navigation */}
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//           gap: '12px',
//           marginBottom: '20px'
//         }}>
//           {insights.map((insight, index) => (
//             <div
//               key={insight.id}
//               className="card-hover"
//               style={{
//                 padding: '12px',
//                 backgroundColor: selectedInsight === index ? insight.bgColor : '#f8fafc',
//                 border: `1px solid ${selectedInsight === index ? insight.borderColor : '#e2e8f0'}`,
//                 borderRadius: '12px',
//                 cursor: 'pointer',
//                 transition: 'all 0.2s ease',
//                 opacity: 0,
//                 animation: `slideIn 0.4s ease-out ${0.6 + index * 0.1}s forwards`
//               }}
//               onClick={() => setSelectedInsight(index)}
//             >
//               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
//                 <div style={{
//                   color: insight.actionColor,
//                   backgroundColor: 'rgba(255, 255, 255, 0.8)',
//                   padding: '6px',
//                   borderRadius: '8px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   {React.cloneElement(insight.icon, { size: 14 })}
//                 </div>
//                 <span style={{
//                   fontSize: '12px',
//                   fontWeight: '600',
//                   color: selectedInsight === index ? insight.textColor : '#64748b'
//                 }}>
//                   {insight.title}
//                 </span>
//               </div>
//               <div style={{
//                 height: '2px',
//                 backgroundColor: selectedInsight === index ? insight.actionColor : '#e2e8f0',
//                 borderRadius: '1px',
//                 transition: 'background-color 0.2s ease'
//               }} />
//             </div>
//           ))}
//         </div>

//         {/* Quick Actions */}
//         <div style={{
//           display: 'flex',
//           gap: '8px',
//           padding: '16px',
//           backgroundColor: '#f8fafc',
//           borderRadius: '12px'
//         }}>
//           <button style={{
//             flex: 1,
//             padding: '10px',
//             fontSize: '13px',
//             color: '#8b5cf6',
//             backgroundColor: '#faf5ff',
//             border: '1px solid #e9d5ff',
//             borderRadius: '8px',
//             fontWeight: '600',
//             cursor: 'pointer',
//             transition: 'all 0.2s ease',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: '6px'
//           }}>
//             <Lightbulb size={14} />
//             Get More Insights
//           </button>
//           <button style={{
//             flex: 1,
//             padding: '10px',
//             fontSize: '13px',
//             color: '#64748b',
//             backgroundColor: 'white',
//             border: '1px solid #e2e8f0',
//             borderRadius: '8px',
//             fontWeight: '500',
//             cursor: 'pointer',
//             transition: 'all 0.2s ease',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: '6px'
//           }}>
//             <Clock size={14} />
//             View History
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SmartInsights;


import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle, PieChart, Calendar, CreditCard, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MonthlyBudgetTracker: React.FC = () => {
  const [budgetData, setBudgetData] = useState({
    totalBudget: 2500,
    totalSpent: 1893,
    totalRemaining: 607,
    categories: [
      {
        id: 1,
        name: 'Housing',
        icon: <Target size={16} />,
        budgeted: 900,
        spent: 850,
        color: '#3b82f6',
        bgColor: '#eff6ff',
        type: 'needs'
      },
      {
        id: 2,
        name: 'Groceries',
        icon: <Wallet size={16} />,
        budgeted: 250,
        spent: 228,
        color: '#10b981',
        bgColor: '#f0fdf4',
        type: 'needs'
      },
      {
        id: 3,
        name: 'Dining Out',
        icon: <CreditCard size={16} />,
        budgeted: 300,
        spent: 245,
        color: '#f59e0b',
        bgColor: '#fffbeb',
        type: 'wants'
      },
      {
        id: 4,
        name: 'Entertainment',
        icon: <Calendar size={16} />,
        budgeted: 150,
        spent: 125,
        color: '#8b5cf6',
        bgColor: '#faf5ff',
        type: 'wants'
      },
      // {
      //   id: 5,
      //   name: 'Transportation',
      //   icon: <ArrowUpRight size={16} />,
      //   budgeted: 200,
      //   spent: 180,
      //   color: '#ef4444',
      //   bgColor: '#fef2f2',
      //   type: 'needs'
      // },
      // {
      //   id: 6,
      //   name: 'Savings',
      //   icon: <CheckCircle size={16} />,
      //   budgeted: 500,
      //   spent: 500,
      //   color: '#06b6d4',
      //   bgColor: '#f0f9ff',
      //   type: 'savings'
      // },
      // {
      //   id: 7,
      //   name: 'Shopping',
      //   icon: <TrendingUp size={16} />,
      //   budgeted: 200,
      //   spent: 275,
      //   color: '#f97316',
      //   bgColor: '#fff7ed',
      //   type: 'wants'
      // }
    ],
    weeklySpending: [
      { week: 'Week 1', amount: 485, target: 625 },
      { week: 'Week 2', amount: 520, target: 625 },
      { week: 'Week 3', amount: 445, target: 625 },
      { week: 'Week 4', amount: 443, target: 625 }
    ],
    monthlyGoals: {
      savingsGoal: 500,
      currentSavings: 500,
      emergencyFund: 2500,
      currentEmergency: 1850
    }
  });

  const [animatedValues, setAnimatedValues] = useState({
    totalSpent: 0,
    totalRemaining: 0,
    categories: budgetData.categories.map(() => 0)
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues({
        totalSpent: budgetData.totalSpent,
        totalRemaining: budgetData.totalRemaining,
        categories: budgetData.categories.map(cat => (cat.spent / cat.budgeted) * 100)
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [budgetData]);

  const getSpentPercentage = (spent: number, budgeted: number) => {
    return Math.min((spent / budgeted) * 100, 100);
  };

  const getBudgetStatus = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage > 100) return { status: 'over', color: '#ef4444', icon: <AlertCircle size={12} /> };
    if (percentage > 80) return { status: 'warning', color: '#f59e0b', icon: <AlertCircle size={12} /> };
    return { status: 'good', color: '#10b981', icon: <CheckCircle size={12} /> };
  };

  const totalBudgetPercentage = (budgetData.totalSpent / budgetData.totalBudget) * 100;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      opacity: 0,
      animation: 'fadeInUp 0.6s ease-out 1.1s forwards'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={20} style={{ color: '#10b981' }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Monthly Budget Tracker
            </h3>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px'
          }}>
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
              June 2024
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Budget Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Total Budget */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <DollarSign size={24} style={{ color: '#3b82f6', marginBottom: '8px' }} />
            <p style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 4px 0'
            }}>
              ${budgetData.totalBudget.toLocaleString()}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              margin: 0
            }}>
              Total Budget
            </p>

            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '50%'
            }} />
          </div>

          {/* Total Spent */}
          <div style={{
            padding: '20px',
            backgroundColor: totalBudgetPercentage > 80 ? '#fef2f2' : '#f0fdf4',
            borderRadius: '16px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <TrendingDown size={24} style={{
              color: totalBudgetPercentage > 80 ? '#ef4444' : '#10b981',
              marginBottom: '8px'
            }} />
            <p style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 4px 0'
            }}>
              ${animatedValues.totalSpent.toLocaleString()}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              margin: '0 0 4px 0'
            }}>
              Total Spent
            </p>
            <div style={{
              fontSize: '10px',
              color: totalBudgetPercentage > 80 ? '#ef4444' : '#10b981',
              fontWeight: '600'
            }}>
              {totalBudgetPercentage.toFixed(1)}% of budget
            </div>
          </div>

          {/* Remaining */}
          <div style={{
            padding: '20px',
            backgroundColor: '#fffbeb',
            borderRadius: '16px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Wallet size={24} style={{ color: '#f59e0b', marginBottom: '8px' }} />
            <p style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 4px 0'
            }}>
              ${animatedValues.totalRemaining.toLocaleString()}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              margin: 0
            }}>
              Remaining
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Category Breakdown
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px'
          }}>
            {budgetData.categories.map((category, index) => {
              const percentage = getSpentPercentage(category.spent, category.budgeted);
              const status = getBudgetStatus(category.spent, category.budgeted);

              return (
                <div
                  key={category.id}
                  style={{
                    padding: '16px',
                    backgroundColor: category.bgColor,
                    borderRadius: '12px',
                    border: `1px solid ${category.color}20`,
                    opacity: 0,
                    animation: `slideIn 0.4s ease-out ${1.3 + index * 0.1}s forwards`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        color: category.color,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        padding: '6px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {category.icon}
                      </div>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1e293b'
                      }}>
                        {category.name}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: status.color
                    }}>
                      {status.icon}
                      <span style={{ fontSize: '10px', fontWeight: '500' }}>
                        {percentage > 100 ? 'Over Budget' : percentage > 80 ? 'Warning' : 'On Track'}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        ${category.spent} / ${category.budgeted}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: category.spent > category.budgeted ? '#ef4444' : '#10b981'
                      }}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>

                    <div style={{
                      height: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        backgroundColor: category.spent > category.budgeted ? '#ef4444' : category.color,
                        width: `${Math.min(animatedValues.categories[index] || 0, 100)}%`,
                        borderRadius: '3px',
                        transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '3px',
                          height: '100%',
                          backgroundColor: 'rgba(255, 255, 255, 0.4)',
                          animation: 'shimmer 2s infinite'
                        }} />
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '11px',
                    color: '#64748b'
                  }}>
                    ${(category.budgeted - category.spent).toLocaleString()} remaining
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Spending Trend */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '12px',
            margin: '0 0 12px 0'
          }}>
            Weekly Spending Trend
          </h4>

          <div style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'space-between',
            height: '80px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '16px 12px 12px 12px'
          }}>
            {budgetData.weeklySpending.map((week, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1
                }}
              >
                <div
                  style={{
                    width: '24px',
                    backgroundColor: week.amount > week.target ? '#ef4444' : '#10b981',
                    borderRadius: '4px',
                    height: `${(week.amount / week.target) * 50}px`,
                    transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    animation: `fadeInUp 0.5s ease-out ${1.5 + index * 0.1}s forwards`
                  }}
                />
                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 2px 0'
                  }}>
                    ${week.amount}
                  </p>
                  <p style={{
                    fontSize: '9px',
                    color: '#64748b',
                    margin: 0
                  }}>
                    {week.week}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Goals */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '16px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Target size={14} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                Monthly Savings Goal
              </span>
            </div>
            <div style={{
              height: '6px',
              backgroundColor: '#e2e8f0',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '4px'
            }}>
              <div style={{
                height: '100%',
                backgroundColor: '#10b981',
                width: `${(budgetData.monthlyGoals.currentSavings / budgetData.monthlyGoals.savingsGoal) * 100}%`,
                borderRadius: '3px',
                transition: 'width 1s ease-out'
              }} />
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
              ${budgetData.monthlyGoals.currentSavings} / ${budgetData.monthlyGoals.savingsGoal}
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <CheckCircle size={14} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                Emergency Fund
              </span>
            </div>
            <div style={{
              height: '6px',
              backgroundColor: '#e2e8f0',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '4px'
            }}>
              <div style={{
                height: '100%',
                backgroundColor: '#3b82f6',
                width: `${(budgetData.monthlyGoals.currentEmergency / budgetData.monthlyGoals.emergencyFund) * 100}%`,
                borderRadius: '3px',
                transition: 'width 1s ease-out'
              }} />
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
              ${budgetData.monthlyGoals.currentEmergency} / ${budgetData.monthlyGoals.emergencyFund}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{
            flex: 1,
            padding: '10px',
            fontSize: '13px',
            color: '#10b981',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            Add Transaction
          </button>
          <button style={{
            flex: 1,
            padding: '10px',
            fontSize: '13px',
            color: '#3b82f6',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            Edit Budget →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MonthlyBudgetTracker;