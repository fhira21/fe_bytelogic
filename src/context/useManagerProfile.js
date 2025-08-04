import { useState, useEffect } from 'react';
import axios from 'axios';

const useManagerProfile = () => {
  const [managerProfile, setManagerProfile] = useState({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    const fetchManagerProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://be.bytelogic.orenjus.com/api/managers/profile',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setManagerProfile({
          loading: false,
          data: response.data.data,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching manager profile:', error);
        setManagerProfile({
          loading: false,
          data: null,
          error: 'Gagal mengambil profil',
        });
      }
    };

    fetchManagerProfile();
  }, []);

  return managerProfile;
};

export default useManagerProfile;