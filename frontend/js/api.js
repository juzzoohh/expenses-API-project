import { API_BASE_URL } from './config.js';

// Helper: Ambil token dari LocalStorage
function getAuthHeader() {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// 1. GET: Ambil Semua Buku (Expenses)
export async function getAllBooks() {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      headers: getAuthHeader() // <--- Sisipkan Token
    });
    
    if (response.status === 401) {
        alert("Sesi habis. Silakan login lagi.");
        window.location.href = 'login.html'; // (Nanti kita buat halaman login)
        return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// 2. POST: Tambah Data
export async function createBook(bookData) {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader() // <--- Sisipkan Token
      },
      body: JSON.stringify(bookData)
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating data:", error);
    return { status: 'error', message: 'Gagal koneksi ke server' };
  }
}

// 3. DELETE: Hapus Data
export async function removeBook(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader() // <--- Sisipkan Token
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting data:", error);
    return { status: 'error', message: 'Gagal koneksi ke server' };
  }
}