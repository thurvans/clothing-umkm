import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Token verifikasi tidak ditemukan');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await authAPI.verifyEmail(token);
      setStatus('success');
      setMessage(response.data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verifikasi gagal');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card text-center">
            <div className="card-body p-5">
              {status === 'loading' && (
                <>
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h4>Memverifikasi email...</h4>
                </>
              )}

              {status === 'success' && (
                <>
                  <i className="bi bi-check-circle-fill text-success display-1 mb-3"></i>
                  <h3 className="mb-3">Verifikasi Berhasil!</h3>
                  <p className="text-muted mb-4">{message}</p>
                  <Link to="/login" className="btn btn-primary">
                    Login Sekarang
                  </Link>
                </>
              )}

              {status === 'error' && (
                <>
                  <i className="bi bi-x-circle-fill text-danger display-1 mb-3"></i>
                  <h3 className="mb-3">Verifikasi Gagal</h3>
                  <p className="text-muted mb-4">{message}</p>
                  <Link to="/login" className="btn btn-outline-primary">
                    Kembali ke Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
