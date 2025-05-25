import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Profile from './Profile';

const LoginComponent = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Токен не найден');

            const response = await fetch('http://localhost:8000/api/profile/me/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Ошибка при загрузке профиля');
            const data = await response.json();
            setProfile(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const login = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/api/profile/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) throw new Error('Ошибка авторизации');
            const data = await response.json();

            localStorage.setItem('token', data.token);
            fetchProfile();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) fetchProfile();
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
