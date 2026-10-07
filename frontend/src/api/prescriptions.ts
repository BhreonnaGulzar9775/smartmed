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

export const getPrescriptionsByPatient = async (patientId: string) => {
    const { data } = await api.get<Prescription[]>(`/prescriptions/patient/${patientId}`)
    return data
}

export const dispensePrescription = async (id: string) => {
    await api.post(`/prescriptions/${id}/dispense`)
}