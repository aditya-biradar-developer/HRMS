const { supabase } = require('../config/db');
const { isWeekend, getWorkingDays: getWorkingDaysHelper } = require('../utils/dateHelper');

class Attendance {
  // Create attendance record
  static async create(attendanceData) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .insert([attendanceData])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Get attendance by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  // Get attendance by user ID
  static async findByUserId(userId, limit = 100, offset = 0, startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          user:users!attendance_user_id_fkey (
            id,
            name,
            email,
            department
          )
        `)
        .eq('user_id', userId);
      
      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }
      
      const { data, error } = await query
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  // Get all attendance (for admin, hr, manager)
  static async getAll(limit = 100, offset = 0, startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          user:users!attendance_user_id_fkey (
            id,
            name,
            email,
            department
          )
        `);
      
      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }
      
      const { data, error } = await query
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  // Update attendance
  static async update(id, attendanceData) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .update(attendanceData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Delete attendance
  static async delete(id) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  // Get attendance statistics
  static async getStats(userId = null, startDate, endDate) {
    try {
      // Use IST-aware date helpers to avoid timezone issues
      console.log(`📊 Calculating stats for period: ${startDate} to ${endDate} (IST)`);
      
      const getWorkingDays = (start, end, employeeStartDate = null) => {
        return getWorkingDaysHelper(start, end, employeeStartDate);
      };
      
      // Fetch employee start date if querying for specific user
      let employeeStartDate = null;
      if (userId) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('start_date')
            .eq('id', userId)
            .single();
          
          if (userError) {
            console.log(`⚠️ Could not fetch user start_date:`, userError.message);
          } else if (userData && userData.start_date) {
            employeeStartDate = userData.start_date;
            console.log(`👤 Employee start date: ${employeeStartDate}`);
          } else {
            console.log(`ℹ️ User ${userId} has no start_date set - using query start date`);
          }
        } catch (err) {
          console.log(`⚠️ Error fetching user data:`, err.message);
          // Continue without employee start date
        }
      }
      
      let query = supabase
        .from('attendance')
        .select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        // For organization-wide stats, filter out admin and candidate attendance
        // First get all employee user IDs (excluding admin and candidate)
        const { data: allUsers } = await supabase
          .from('users')
          .select('id')
          .not('role', 'in', '(admin,candidate)');
        
        const employeeUserIds = allUsers?.map(u => u.id) || [];
        console.log(`🔍 Filtering attendance for ${employeeUserIds.length} employees (excluding admin/candidate)`);
        
        if (employeeUserIds.length > 0) {
          query = query.in('user_id', employeeUserIds);
        } else {
          // No employees found, return empty data
          console.log('⚠️ No employees found, returning empty stats');
          return {
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            leaveDays: 0,
            workingDaysCount: 0,
            attendancePercentage: 0,
            weekendDays: 0,
            weekendPresent: 0
          };
        }
      }
      
      if (startDate) {
        query = query.gte('date', startDate);
      }
      
      if (endDate) {
        query = query.lte('date', endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Get all working days in the date range (respecting employee start date)
      const workingDays = getWorkingDays(startDate, endDate, employeeStartDate);
      const workingDaysCount = workingDays.length;
      
      // Calculate statistics
      let presentDays, absentDays, lateDays, leaveDays;
      
      if (userId) {
        // Individual user: Only count records within working days range
        const recordsInWorkingDays = data.filter(record => workingDays.includes(record.date));
        
        presentDays = recordsInWorkingDays.filter(record => record.status === 'present').length;
        lateDays = recordsInWorkingDays.filter(record => record.status === 'late').length;
        leaveDays = recordsInWorkingDays.filter(record => record.status === 'on_leave').length;
        
        // Marked absent days (only within working days)
        const markedAbsentDays = recordsInWorkingDays.filter(record => record.status === 'absent').length;
        
        // Get all marked dates (including leaves) within working days
        const markedDates = recordsInWorkingDays.map(r => r.date);
        
        // Unmarked working days = absent (but exclude dates with approved leaves)
        // If employee has leave on a day, it's already counted in leaveDays, not absent
        const unmarkedWorkingDays = workingDays.filter(day => !markedDates.includes(day));
        
        // Total absent = marked absent + unmarked working days (leaves are separate)
        absentDays = markedAbsentDays + unmarkedWorkingDays.length;
        
        console.log(`🔍 Debug: total records=${data.length}, records in working days=${recordsInWorkingDays.length}, working days count=${workingDaysCount}`);
        console.log(`🔍 Present=${presentDays}, Late=${lateDays}, Leave=${leaveDays}, Marked Absent=${markedAbsentDays}, Unmarked=${unmarkedWorkingDays.length}`);
      } else {
        // Organization-wide: Calculate attendance statistics for all employees
        const recordsInWorkingDays = data.filter(record => workingDays.includes(record.date));
        
        // Count marked attendance by status (simple count of actual records)
        presentDays = recordsInWorkingDays.filter(r => r.status === 'present').length;
        lateDays = recordsInWorkingDays.filter(r => r.status === 'late').length;
        leaveDays = recordsInWorkingDays.filter(r => r.status === 'on_leave').length;
        absentDays = recordsInWorkingDays.filter(r => r.status === 'absent').length;
        
        console.log(`🏢 Organization-wide stats: total records=${data.length}, on working days=${recordsInWorkingDays.length}`);
        console.log(`📊 Status breakdown: Present=${presentDays}, Late=${lateDays}, Leave=${leaveDays}, Absent=${absentDays}`);
        console.log(`📊 Working days in period: ${workingDaysCount}`);
      }
      
      // Calculate percentage based on working days (excluding weekends)
      const attendedDays = presentDays + lateDays;
      let attendancePercentage;
      
      if (userId) {
        // Individual user: percentage = attended days / working days
        attendancePercentage = workingDaysCount > 0 ? (attendedDays / workingDaysCount) * 100 : 0;
      } else {
        // Organization-wide: percentage = total attended records / total expected records
        // Expected records = working days × number of employees
        const allEmployeeIds = [...new Set(data.map(r => r.user_id))];
        const totalExpectedRecords = workingDaysCount * allEmployeeIds.length;
        attendancePercentage = totalExpectedRecords > 0 ? (attendedDays / totalExpectedRecords) * 100 : 0;
        console.log(`📊 Percentage calc: ${attendedDays} attended / (${workingDaysCount} days × ${allEmployeeIds.length} employees = ${totalExpectedRecords}) = ${attendancePercentage.toFixed(1)}%`);
      }
      
      // Validation: Total should equal working days
      const totalCounted = presentDays + lateDays + absentDays + leaveDays;
      if (userId && totalCounted !== workingDaysCount) {
        console.log(`⚠️ MISMATCH: Total counted (${totalCounted}) != Working days (${workingDaysCount})`);
        console.log(`⚠️ Breakdown: Present=${presentDays} + Late=${lateDays} + Absent=${absentDays} + Leave=${leaveDays} = ${totalCounted}`);
      }
      
      // Track weekend/non-working day attendance separately
      const weekendRecords = userId ? data.filter(record => !workingDays.includes(record.date)) : [];
      const weekendPresentDays = weekendRecords.filter(r => r.status === 'present').length;
      
      if (weekendRecords.length > 0) {
        console.log(`📅 Weekend/non-working days: ${weekendRecords.length} records (${weekendPresentDays} present) - not counted in percentage`);
      }
      
      console.log(`📊 Stats calculated: workingDays=${workingDaysCount}, present=${presentDays}, absent=${absentDays}, late=${lateDays}, leave=${leaveDays}, percentage=${attendancePercentage.toFixed(1)}%`);
      
      return {
        totalDays: workingDaysCount,
        presentDays,
        absentDays,
        lateDays,
        leaveDays,
        workingDaysCount,
        attendancePercentage,
        weekendDays: weekendRecords.length,
        weekendPresent: weekendPresentDays
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Attendance;