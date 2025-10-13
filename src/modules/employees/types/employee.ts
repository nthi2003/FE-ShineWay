export interface Employee {
  id: string;
  fullname: string;
  password: string;
  department: "chef" | "waiter" | "manager";
  email: string;
  createdAt: Date;
  employeeId: string;
  salary: number;
  status: "active" | "inactive" | "leave";
  recentActivities: RecentActivity[];
  dateOfBirth: string;
  gender: "Nam" | "Nữ";
  address: string;
  phone: string;
  currentShift?: CurrentShift;
}

export interface ExtendedEmployee extends Employee {
   recentActivities: RecentActivity[];
   dateOfBirth: string;
   gender: 'Nam' | 'Nữ';
   address: string;
   phone: string;
   currentShift?: CurrentShift;
}


export interface RecentActivity {
  date: string;
  time: string;
  action: string;
}

export interface CurrentShift {
  day: number;
  status: "Còn hoạt động" | "Kết thúc";
  note: string;
}