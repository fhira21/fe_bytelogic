import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilePic from '../../assets/images/profile.jpg';
import axios from 'axios';
import {
  Home,
  Folder,
  Briefcase,
  ChartBar,
  FileText,
  Search,
  X,
  User
} from 'lucide-react';

const EmployeeList = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    alamat: '',
    nomor_telepon: '',
    jenis_kelamin: '',
    status_Karyawan: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [managerProfile, setManagerProfile] = useState({
    loading: true,
    data: {
      foto_profile: ProfilePic,
      nama_lengkap: 'Asep Jamaludin Wahid',
      email: 'jamaludinasep@gmail.com'
    }
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios.get('http://localhost:5000/api/karyawan', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        const data = Array.isArray(response.data) ? response.data : response.data.data;
        setEmployees(data);
      })
      .catch(error => console.error('Error fetching employee data:', error));
  };

  const filteredEmployees = employees.filter(employee =>
    employee.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      ...employee,
      password: '',
      confirmPassword: ''
    });
  };

  const closeEditModal = () => {
    setEditingEmployee(null);
    setFormData({
      nama_lengkap: '',
      email: '',
      alamat: '',
      nomor_telepon: '',
      jenis_kelamin: '',
      status_Karyawan: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5000/api/karyawan/${editingEmployee._id}`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        setEmployees(prev => prev.map(emp => (emp._id === editingEmployee._id ? response.data : emp)));
        closeEditModal();
      })
      .catch((error) => console.error('Error updating employee:', error));
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setCurrentStep(1);
    setFormData({
      nama_lengkap: '',
      email: '',
      alamat: '',
      nomor_telepon: '',
      jenis_kelamin: '',
      status_Karyawan: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: 'employee'
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setCurrentStep(1);
  };

  const saveAdd = (e) => {
    e.preventDefault();

    if (currentStep === 1) {
      if (!formData.username || !formData.password || !formData.confirmPassword) {
        alert('Please fill all required fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert('Password and confirmation password do not match');
        return;
      }

      setCurrentStep(2);
      return;
    }

    const dataToSend = {
      ...formData,
      confirmPassword: undefined
    };

    axios.post('http://localhost:5000/api/karyawan', dataToSend, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setEmployees(prev => [...prev, response.data]);
        closeAddModal();
      })
      .catch(error => {
        console.error('Error adding new employee:', error);
        alert('Failed to add employee. Please check the data and try again.');
      });
  };

  const openViewModal = (employee) => {
    setViewingEmployee(employee);
  };

  const closeViewModal = () => {
    setViewingEmployee(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-56 bg-blue-500 p-2 md:p-6 flex flex-col text-white select-none transition-all duration-300">
        <div className="hidden md:flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-full font-semibold text-sm flex items-center justify-center text-blue-700">B</div>
          <span className="font-semibold text-sm">Bytelogic</span>
        </div>
        <h1 className="hidden md:block text-xs font mb-6">MENU</h1>
        <button onClick={() => navigate('/dashboard-manager')}
          className="flex items-center justify-center md:justify-start gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Home size={18} />
          <span className="hidden md:inline">Dashboard</span>
        </button>
        <button onClick={() => navigate('/admin-list')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Folder size={18} />
          <span className="hidden md:inline">Admin Data</span>
        </button>
        <button onClick={() => navigate('/employee-list')} className="flex items-center justify-center md:justify-start gap-2 bg-blue-600 p-2 rounded mb-2">
          <Folder size={18} />
          <span className="hidden md:inline">Employee Data</span>
        </button>
        <button onClick={() => navigate('/client-data')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Folder size={18} />
          <span className="hidden md:inline">Client Data</span>
        </button>
        <button onClick={() => navigate('/data-project')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-blue-600 p-2 rounded mb-2">
          <Folder size={18} />
          <span className="hidden md:inline">Project Data</span>
        </button>
        <button onClick={() => navigate('/employee-evaluation')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <ChartBar size={18} />
          <span className="hidden md:inline">Evaluation</span>
        </button>
        <button onClick={() => navigate('/customer-reviews')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <FileText size={18} />
          <span className="hidden md:inline">Review</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        {/* Topbar */}
        <div className="flex justify-end mb-4">
          <div className="relative">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              <img
                src={managerProfile.data?.foto_profile || ProfilePic}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <div className="hidden md:block">
                <p className="font-medium text-sm">
                  {managerProfile.loading ? 'Asep Jamaludin Wahid' : managerProfile.data?.nama_lengkap}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {managerProfile.data?.email}
                </p>
              </div>
            </div>

            {showProfileDropdown && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                onMouseEnter={() => setShowProfileDropdown(true)}
                onMouseLeave={() => setShowProfileDropdown(false)}
              >
                <div className="px-4 py-3 border-b">
                  <p className="font-medium text-gray-800">{managerProfile.data?.nama_lengkap}</p>
                  <p className="text-sm text-gray-500 truncate">{managerProfile.data?.email}</p>
                </div>

                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-black-700 hover:bg-black-100"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/profile');
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-black-700 hover:bg-black-100"
                  onClick={(e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    navigate('/login');
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Title Section */}
        <h1 className="text-2xl font-bold mb-6">Employee Data</h1>

        {/* Search and Action Section */}
        <div className="flex flex-col md:flex-row justify-end items-center mb-4 gap-2">
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
          >
            <span className="text-sm md:text-base">Add Employee</span>
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Full Name</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Email</th>
                  <th className="hidden sm:table-cell px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Phone</th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Address</th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Gender</th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Status</th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(employee => (
                    <tr key={employee._id}>
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.nama_lengkap || '-'}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.email || '-'}
                      </td>
                      <td className="hidden sm:table-cell px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.nomor_telepon || '-'}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.alamat || '-'}
                      </td>
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.jenis_kelamin || '-'}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${employee.status_Karyawan === 'Aktif' ? 'bg-green-100 text-green-800' :
                            employee.status_Karyawan === 'Tidak Aktif' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}`}>
                          {employee.status_Karyawan || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1 md:gap-2">
                          <button
                            onClick={() => openEditModal(employee)}
                            className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-yellow-600 transition-colors"
                          >
                            <span className="text-sm">Edit</span>
                          </button>
                          <button
                            onClick={() => setDeletingEmployee(employee)}
                            className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <span className="text-sm">Delete</span>
                          </button>
                          <button
                            onClick={() => openViewModal(employee)}
                            className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <span className="text-sm">View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>


        {/* Add Employee Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-lg p-6 w-full ${currentStep === 1 ? 'max-w-md' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {currentStep === 1 ? 'Add Employee' : 'Add Employee'}
                </h3>
                <button
                  onClick={closeAddModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {currentStep === 1 ? (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-4 pb-2 border-b-2 border-gray-300">Login Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="Create Username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="Create Password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="Re-enter Password"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-4 pb-2 border-b-2 border-gray-300">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Date full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <div className="relative">
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleEditChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 uppercase-date-input"
                          required
                          style={{ color: formData.dob ? '#111827' : '#9CA3AF' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                        style={{ color: formData.gender ? '#111827' : '#9CA3AF' }}
                      >
                        <option value="" disabled hidden style={{ color: '#9CA3AF' }}>
                          Select Gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                        style={{ color: formData.gender ? '#111827' : '#9CA3AF' }}
                      >
                        <option value="" disabled hidden>
                          Select Martial Status
                        </option>
                        <option value="male" className="text-gray-900">Single</option>
                        <option value="male" className="text-gray-900">Married</option>
                        <option value="male" className="text-gray-900">Divorced</option>
                        <option value="male" className="text-gray-900">Widowed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Id Number</label>
                      <input
                        type="text"
                        name="nik"
                        value={formData.nik}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Email is number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter educational background"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6 pt-4 border-t">
                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Back
                  </button>
                )}

                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={saveAdd}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Employee
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Delete Employee</h3>
                <button
                  onClick={() => setDeletingEmployee(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="mb-6">Do You Want To Delete Employee {deletingEmployee.nama_lengkap}?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeletingEmployee(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    axios.delete(`http://localhost:5000/api/karyawan/${deletingEmployee._id}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    })
                      .then(() => {
                        setEmployees(prev => prev.filter(emp => emp._id !== deletingEmployee._id));
                        setDeletingEmployee(null);
                      })
                      .catch(error => {
                        console.error('Error deleting employee:', error);
                        alert('Failed to delete employee. Please try again.');
                      });
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Employee Modal */}
        {editingEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Edit Employee</h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={saveEdit}>
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-4 pb-2 border-b-2 border-gray-300">Employee Information</h4>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="nama_lengkap"
                        value={formData.nama_lengkap}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="nomor_telepon"
                        value={formData.nomor_telepon}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        name="jenis_kelamin"
                        value={formData.jenis_kelamin}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="Laki-laki">Male</option>
                        <option value="Perempuan">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status_Karyawan"
                        value={formData.status_Karyawan}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Status</option>
                        <option value="Aktif">Active</option>
                        <option value="Tidak Aktif">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter address"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="text-sm font-medium mb-4">Login Information</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleEditChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleEditChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Leave blank to keep current"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleEditChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Employee Modal */}
        {viewingEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Employee Details</h3>
                <button
                  onClick={closeViewModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-4 pb-2 border-b">Login Information</h4>

                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Username:</span>
                      <span className="w-2/3 text-gray-900">{viewingEmployee.username || '-'}</span>
                    </div>
                  </div>

                  <h4 className="text-lg font-medium mb-4 pb-2 border-b">Personal Information</h4>
                  <div className="grid grid-cols-1 gap-6 mb-6">
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Full Name:</span>
                      <span className="w-2/3 text-gray-900">{viewingEmployee.nama_lengkap || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Email:</span>
                      <span className="w-2/3 text-gray-900">{viewingEmployee.email || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Phone Number:</span>
                      <span className="w-2/3 text-gray-900">{viewingEmployee.nomor_telepon || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Address:</span>
                      <span className="w-2/3 text-gray-900">{viewingEmployee.alamat || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Gender:</span>
                      <span className="w-2/3 text-gray-900">{viewingEmployee.jenis_kelamin || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Status:</span>
                      <span className={`w-2/3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${viewingEmployee.status_Karyawan === 'Aktif' ? 'bg-green-100 text-green-800' :
                          viewingEmployee.status_Karyawan === 'Tidak Aktif' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}`}>
                        {viewingEmployee.status_Karyawan || '-'}
                      </span>
                    </div>
                  </div>

                  {/* Back Button */}
                  <div className="flex justify-start pt-6">
                    <button
                      onClick={closeViewModal}
                      className="px-4 py-2 bg-gray-200 font-medium text-black rounded-md hover:bg-gray-300"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeList;