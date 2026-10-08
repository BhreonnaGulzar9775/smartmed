import api from './client'

export interface Prescription {
    id: string
    prescriptionNumber: string
    status: string
    createdAt: string
    patientId: string
    patientName: string
    branchId: string
    branchName: string
    items: {
        medicineId: string
        medicineName: string
        dosage?: string
        quantity: number
        instructions?: string
    }[]
}

export const getAllPrescriptions = async () => {
    const { data } = await api.get<Prescription[]>('/prescriptions')
    return data
}

export const getMyPrescriptions = async () => {
    const { data } = await api.get<Prescription[]>('/prescriptions/me')
    return data
}

export const getPrescriptionsByPatient = async (patientId: string) => {
    const { data } = await api.get<Prescription[]>(`/prescriptions/patient/${patientId}`)
    return data
}

export const getPrescription = async (id: string) => {
    const { data } = await api.get<Prescription>(`/prescriptions/${id}`)
    return data
}

export const createPrescription = async (payload: {
    patientId: string
    branchId: string
    notes?: string
    items: { medicineId: string; dosage?: string; quantity: number; instructions?: string }[]
}) => {
    const { data } = await api.post('/prescriptions', payload)
    return data
}

export const dispensePrescription = async (id: string) => {
    await api.post(`/prescriptions/${id}/dispense`)
}