import React, { useState, useEffect } from 'react';
import { Clock, Users, FileText, Calendar, AlertCircle, CheckCircle, X } from 'lucide-react';

const NotificationTooltip = ({ type, count, isVisible, isPinned, onClose }) => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && count > 0) {
      fetchNotificationDetails();
    }
  }, [isVisible, count, type]);

  const fetchNotificationDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      console.log('🔄 Fetching notification details:', {
        type,
        count,
        apiUrl: `${API_URL}/notifications/details`,
        hasToken: !!token
      });
      
      const response = await fetch(`${API_URL}/notifications/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔔 Notification details received:', {
          type,
          count,
          fullData: data,
          specificTypeData: data.data?.[type] || [],
          allTypes: Object.keys(data.data || {})
        });
        if (data.success) {
          const receivedDetails = data.data[type] || [];
          console.log('📋 Setting details:', receivedDetails);
          setDetails(receivedDetails);
          
          // Log if no details received but we expect some
          if (receivedDetails.length === 0 && count > 0) {
            console.log('⚠️ No details received but count > 0 - API issue detected');
          }
        } else {
          console.error('❌ API returned success: false:', data);
        }
      } else {
        console.error('❌ Failed to fetch notification details:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible || count === 0) return null;

  const getIcon = () => {
    switch (type) {
      case 'attendance':
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'applications':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'leaves':
        return <Clock className="w-4 h-4 text-green-500" />;
      case 'users':
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'attendance':
        return 'Attendance Notifications';
      case 'applications':
        return 'Application Notifications';
      case 'leaves':
        return 'Leave Notifications';
      case 'users':
        return 'User Notifications';
      default:
        return 'Notifications';
    }
  };

  return (
    <div className={`fixed left-72 top-20 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 ${isPinned ? 'border-blue-500 border-2' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        {getIcon()}
        <h3 className="font-medium text-gray-900">{getTitle()}</h3>
        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
        {isPinned && onClose && (
          <button
            onClick={onClose}
            className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Close notification"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-500">Loading...</span>
          </div>
        ) : details.length > 0 ? (
          <div className="space-y-2">
            {details.slice(0, 5).map((notification, index) => (
              <div key={notification.id || index} className="p-3 bg-gray-50 rounded-md border-l-4 border-blue-500">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {notification.type === 'missing_attendance' && <Calendar className="w-4 h-4 text-orange-500" />}
                    {notification.type === 'pending_application' && <FileText className="w-4 h-4 text-blue-500" />}
                    {notification.type === 'pending_leave' && <Clock className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-semibold">
                      {notification.name}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {notification.message}
                    </p>
                    {notification.date && (
                      <p className="text-xs text-gray-500 mt-2 font-medium">
                        {new Date(notification.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {details.length > 5 && (
              <div className="text-center py-2 bg-blue-50 rounded-md">
                <span className="text-sm text-blue-600 font-medium">
                  +{details.length - 5} more notifications
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium">All caught up!</p>
            <p className="text-xs text-gray-500 mt-1">No pending notifications</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {details.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 bg-blue-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
          <p className="text-xs text-blue-600 text-center font-medium">
            💡 Click on "{getTitle().replace(' Notifications', '')}" menu to manage these items
          </p>
          {!isPinned && (
            <p className="text-xs text-gray-500 text-center mt-1">
              📌 Click the notification badge to pin this tooltip
            </p>
          )}
        </div>
      )}

      {/* Arrow pointing to the sidebar */}
      <div className="absolute left-0 top-6 transform -translate-x-full">
        <div className="w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-white"></div>
      </div>
    </div>
  );
};

export default NotificationTooltip;
