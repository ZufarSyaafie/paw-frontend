import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  tempEmail: string | null;
}

const initialState: AuthState = {
  tempEmail: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Aksi untuk NYIMPEN email sementara
    setTempEmail: (state, action: PayloadAction<string>) => {
      state.tempEmail = action.payload;
    },
    // Aksi untuk NGEBERSIHIN email
    clearTempEmail: (state) => {
      state.tempEmail = null;
    },
  },
});

// Ekspor aksinya biar bisa dipake di komponen
export const { setTempEmail, clearTempEmail } = authSlice.actions;

// Ekspor reducernya buat disimpen di store
export default authSlice.reducer;