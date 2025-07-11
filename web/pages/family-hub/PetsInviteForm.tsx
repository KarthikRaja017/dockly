
'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Typography, notification, Select } from 'antd';
import { addPet, addPets } from '../../services/family';
const { Text } = Typography;

// Define types
type FormDataState = {
    petName: string;
    petType: string;
    petBreed: string;
    guardianEmail: string;
    guardianContact: string;
};

interface PetInviteFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (formData: FormDataState) => void;
}

const PetInviteForm: React.FC<PetInviteFormProps> = ({ visible, onCancel, onSubmit }) => {
    const [step, setStep] = useState<'add' | 'review' | 'sent'>('add');
    const [formData, setFormData] = useState<FormDataState>({
        petName: '',
        petType: 'Dog',
        petBreed: '',
        guardianEmail: '',
        guardianContact: '',
    });
    const [pendingPet, setPendingPet] = useState<FormDataState | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Popular pet types in the U.S.
    const petTypes = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Other'];

    useEffect(() => {
        if (!visible) {
            setStep('add');
            setFormData({
                petName: '',
                petType: 'Dog',
                petBreed: '',
                guardianEmail: '',
                guardianContact: '',
            });
            setPendingPet(null);
        }
    }, [visible]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePetTypeChange = (value: string) => {
        setFormData((prev) => ({ ...prev, petType: value }));
    };

    const isFormValid = () => {
        return (
            formData.petName &&
            formData.petType &&
            formData.petBreed &&
            formData.guardianEmail &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guardianEmail) &&
            formData.guardianContact &&
            /^\d{10,15}$/.test(formData.guardianContact.replace(/\D/g, ''))
        );
    };

    const handleSendInvitation = async () => {
        setLoading(true);
        try {
            const response = await addPet({
                name: formData.petName,
                species: formData.petType,
                breed: formData.petBreed,
                guardianEmail: formData.guardianEmail,
                guardianContact: formData.guardianContact,
                userId: localStorage.getItem('userId') || '',
            });
            const responseData = response?.data || response;
            const status = responseData?.status ?? false;
            const responseMessage = responseData?.message ?? 'Unknown error';

            if (status) {
                onSubmit(formData);
                setPendingPet(formData);
                setStep('sent');

                // const subject = `Pet Addition Notification for ${formData.petName}`;
                // const body = `Dear Guardian,\n\n${formData.petName} (${formData.petType}, ${formData.petBreed}) has been added to our Family Hub.\nContact: ${formData.guardianContact}\nEmail: ${formData.guardianEmail}\n\nBest regards,\nFamily Hub Team`;
                // const encodedSubject = encodeURIComponent(subject);
                // const encodedBody = encodeURIComponent(body);
                // const mailtoLink = `mailto:${formData.guardianEmail}?subject=${encodedSubject}&body=${encodedBody}`;

                // try {
                //   window.location.href = mailtoLink;
                // } catch (mailError) {
                //   console.error('Error opening mailto:', mailError);
                //   notification.warning({
                //     message: 'Email Client Issue',
                //     description: 'Unable to open the email client, but the pet was added successfully.',
                //     placement: 'topRight',
                //     duration: 3,
                //   });
                // }
            } else {
                notification.error({
                    message: 'Error Adding Pet',
                    description: responseMessage,
                    placement: 'topRight',
                    duration: 3,
                });
            }
        } catch (error) {
            console.error('Error in handleSendInvitation:', error);
            notification.error({
                message: 'Error Adding Pet',
                description: 'Unable to process the pet addition. Please try again.',
                placement: 'topRight',
                duration: 3,
            });
        } finally {
            setLoading(false);
        }
    };

    const renderAddForm = () => (
        <div style={{ padding: '24px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2d3748', marginBottom: '24px' }}>
                Add a New Pet
            </h2>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
                    Pet Name
                </label>
                <Input
                    type="text"
                    name="petName"
                    value={formData.petName}
                    onChange={handleInputChange}
                    placeholder="Enter pet name"
                    style={{
                        width: '100%',
                        height: '40px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        padding: '8px 12px',
                        fontSize: '14px',
                        transition: 'border-color 0.3s, box-shadow 0.3s',
                    }}
                />
                {!formData.petName && (
                    <Text style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px', display: 'block' }}>

                    </Text>
                )}
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
                    Pet Type
                </label>
                <Select
                    value={formData.petType}
                    onChange={handlePetTypeChange}
                    style={{
                        width: '100%',
                        height: '40px',
                        borderRadius: '6px',
                        fontSize: '14px',
                    }}
                    options={petTypes.map((type) => ({ value: type, label: type }))}
                />
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
                    Pet Breed
                </label>
                <Input
                    type="text"
                    name="petBreed"
                    value={formData.petBreed}
                    onChange={handleInputChange}
                    placeholder="Enter pet breed"
                    style={{
                        width: '100%',
                        height: '40px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        padding: '8px 12px',
                        fontSize: '14px',
                        transition: 'border-color 0.3s, box-shadow 0.3s',
                    }}
                />
                {!formData.petBreed && (
                    <Text style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px', display: 'block' }}>

                    </Text>
                )}
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
                    Guardian Email
                </label>
                <Input
                    type="email"
                    name="guardianEmail"
                    value={formData.guardianEmail}
                    onChange={handleInputChange}
                    placeholder="Enter guardian email"
                    style={{
                        width: '100%',
                        height: '40px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        padding: '8px 12px',
                        fontSize: '14px',
                        transition: 'border-color 0.3s, box-shadow 0.3s',
                    }}
                />
                {formData.guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guardianEmail) && (
                    <Text style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Please enter a valid email address.
                    </Text>
                )}
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
                    Guardian Contact
                </label>
                <Input
                    type="tel"
                    name="guardianContact"
                    value={formData.guardianContact}
                    onChange={handleInputChange}
                    placeholder="Enter guardian phone"
                    style={{
                        width: '100%',
                        height: '40px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        padding: '8pxEAR 12px',
                        fontSize: '14px',
                        transition: 'border-color 0.3s, box-shadow 0.3s',
                    }}
                />
                {formData.guardianContact && !/^\d{10,15}$/.test(formData.guardianContact.replace(/\D/g, '')) && (
                    <Text style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Please enter a valid phone number.
                    </Text>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                <Button
                    onClick={onCancel}
                    style={{
                        height: '40px',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0',
                        color: '#4a5568',
                        fontSize: '14px',
                        padding: '0 24px',
                        transition: 'background-color 0.3s',
                    }}
                >
                    Cancel
                </Button>
                <Button
                    type="primary"
                    disabled={!isFormValid()}
                    onClick={() => setStep('review')}
                    style={{
                        height: '40px',
                        borderRadius: '20px',
                        backgroundColor: '#3182ce',
                        borderColor: '#3182ce',
                        color: '#ffffff',
                        fontSize: '14px',
                        padding: '0 24px',
                        transition: 'background-color 0.3s',
                    }}
                >
                    Continue
                </Button>
            </div>
        </div>
    );

    const renderReview = () => (
        <div style={{ padding: '24px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748', marginBottom: '24px' }}>
                Review Pet Details
            </h3>
            <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: '#4a5568', margin: '8px 0' }}>
                    <span style={{ fontWeight: '500' }}>Pet Name:</span> {formData.petName}
                </p>
                <p style={{ fontSize: '14px', color: '#4a5568', margin: '8px 0' }}>
                    <span style={{ fontWeight: '500' }}>Pet Type:</span> {formData.petType}
                </p>
                <p style={{ fontSize: '14px', color: '#4a5568', margin: '8px 0' }}>
                    <span style={{ fontWeight: '500' }}>Pet Breed:</span> {formData.petBreed}
                </p>
                <p style={{ fontSize: '14px', color: '#4a5568', margin: '8px 0' }}>
                    <span style={{ fontWeight: '500' }}>Guardian Email:</span> {formData.guardianEmail}
                </p>
                <p style={{ fontSize: '14px', color: '#4a5568', margin: '8px 0' }}>
                    <span style={{ fontWeight: '500' }}>Guardian Contact:</span> {formData.guardianContact}
                </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                <Button
                    onClick={() => setStep('add')}
                    style={{
                        height: '40px',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0',
                        color: '#4a5568',
                        fontSize: '14px',
                        padding: '0 24px',
                        transition: 'background-color 0.3s',
                    }}
                >
                    Back
                </Button>
                <Button
                    type="primary"
                    onClick={handleSendInvitation}
                    loading={loading}
                    style={{
                        height: '40px',
                        borderRadius: '20px',
                        backgroundColor: '#3182ce',
                        borderColor: '#3182ce',
                        color: '#ffffff',
                        fontSize: '14px',
                        padding: '0 24px',
                        transition: 'background-color 0.3s',
                    }}
                >
                    Add Pet
                </Button>
            </div>
        </div>
    );

    const renderSent = () => (
        <div style={{ padding: '24px', backgroundColor: '#f7fafc', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748', marginBottom: '24px' }}>
                Pet Added!
            </h3>
            <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '24px' }}>
                {pendingPet?.petName} ({pendingPet?.petType}, {pendingPet?.petBreed}) has been added to the Family Hub.
            </p>
            <Button
                type="primary"
                onClick={onCancel}
                style={{
                    height: '40px',
                    borderRadius: '20px',
                    backgroundColor: '#3182ce',
                    borderColor: '#3182ce',
                    color: '#ffffff',
                    fontSize: '14px',
                    padding: '0 24px',
                    transition: 'background-color 0.3s',
                }}
            >
                Done
            </Button>
        </div>
    );

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
            style={{ borderRadius: '10px' }}
            styles={{ body: { padding: '0', borderRadius: '10px', backgroundColor: '#f7fafc' } }}
        >
            {step === 'add' && renderAddForm()}
            {step === 'review' && renderReview()}
            {step === 'sent' && renderSent()}
        </Modal>
    );
};

export default PetInviteForm;