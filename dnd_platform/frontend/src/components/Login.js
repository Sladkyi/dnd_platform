import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Profile from './Profile';
import axios from 'axios';
import axiosInstance from '../axiosInstance';

const LoginComponent = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('/profile/me/');
      setProfile(response.data);
    } catch (err) {
      console.error(err);
      setError('Ошибка при загрузке профиля');
    }
  };

  const login = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post('http://localhost:8000/api/token/', {
        username,
        password,
      });

      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);

      await fetchProfile();
    } catch (err) {
      console.error(err);
      setError('Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const access = localStorage.getItem('access');
    if (access) fetchProfile();
  }, []);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4 shadow">
            {error && <p className="text-danger text-center">{error}</p>}
            {!profile ? (
              <div>
                <h1>Вход</h1>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Логин"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  className="form-control mb-3"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="btn btn-primary w-100"
                  onClick={login}
                  disabled={loading}
                >
                  {loading ? 'Вход...' : 'Войти'}
                </button>
              </div>
            ) : (
              <Profile profile={profile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
