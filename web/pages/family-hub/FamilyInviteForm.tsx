'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Card, Button, Input, Checkbox, Typography, notification, Tag, Divider } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { addFamilyMember } from '../../services/family';
import { Hubs } from '../../app/comman';
const { Text, Title } = Typography;

// Utility functions for validation
function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
    return /^\d{10,15}$/.test(phone.replace(/\D/g, ''));
}

// Define types
type PermissionState = {
    type: 'Full Access' | 'Custom Access';
    allowAdd?: boolean;
    allowEdit?: boolean;
    allowDelete?: boolean;
    allowInvite?: boolean;
    notify?: boolean;
};

type FormDataState = {
    name: string;
    relationship: string;
    email: string;
    phone: string;
    accessCode: string;
    method: 'Email' | 'Mobile' | 'Access Code';
    permissions: PermissionState;
    sharedItems: { [category: string]: string[] };
};

interface FamilyInviteFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (formData: FormDataState) => void;
    isEditMode?: boolean;
    initialData?: FormDataState;
}

const FamilyInviteForm: React.FC<FamilyInviteFormProps> = ({ visible, onCancel, onSubmit, isEditMode = false, initialData }) => {
    const [step, setStep] = useState<'add' | 'permissions' | 'share' | 'review' | 'sent'>('add');
    const [selectedMethod, setSelectedMethod] = useState<'Email' | 'Mobile' | 'Access Code'>('Email');
    const [formData, setFormData] = useState<FormDataState>(
        initialData || {
            name: '',
            relationship: '',
            email: '',
            phone: '',
            accessCode: '',
            method: 'Email',
            permissions: { type: 'Custom Access' },
            sharedItems: {},
        }
    );
    const [pendingMember, setPendingMember] = useState<FormDataState | null>(null);
    const [username, setUsername] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        let storedUsername = localStorage.getItem('username') || (params && params.username);
        if (Array.isArray(storedUsername)) {
            storedUsername = storedUsername[0];
        }
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, [params?.username]);

    useEffect(() => {
        console.log('Modal visibility changed:', visible, 'Resetting form');
        if (!visible) {
            setStep('add');
            setFormData({
                name: '',
                relationship: '',
                email: '',
                phone: '',
                accessCode: '',
                method: 'Email',
                permissions: { type: 'Custom Access' },
                sharedItems: {},
            });
            setPendingMember(null);
            setSelectedMethod('Email');
        } else if (isEditMode && initialData) {
            setFormData(initialData);
            setSelectedMethod(initialData.method);
        }
    }, [visible, isEditMode, initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePermissionChange = (key: keyof PermissionState) => {
        setFormData((prev) => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [key]: !prev.permissions[key as keyof PermissionState],
            },
        }));
    };

    const handlePermissionTypeChange = (type: 'Full Access' | 'Custom Access') => {
        setFormData((prev) => ({
            ...prev,
            permissions: {
                type,
                ...(type === 'Full Access'
                    ? { allowAdd: true, allowEdit: true, allowDelete: true, allowInvite: true, notify: true }
                    : { allowAdd: false, allowEdit: false, allowDelete: false, allowInvite: false, notify: false }),
            },
        }));
    };

    // Handle sharing options
    const isParentChecked = (categoryName: string) => {
        const category = Hubs.find((c) => c.label.name === categoryName);
        return category?.children.length
            ? formData.sharedItems[categoryName]?.length === category.children.length
            : false;
    };

    const toggleParent = (category: string, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            sharedItems: {
                ...prev.sharedItems,
                [category]: checked
                    ? Hubs.find((c) => c.label.name === category)?.children.map((c) => c.name) || []
                    : [],
            },
        }));
    };

    const toggleChild = (category: string, item: string) => {
        setFormData((prev) => {
            const currentItems = prev.sharedItems[category] || [];
            const newItems = currentItems.includes(item)
                ? currentItems.filter((i) => i !== item)
                : [...currentItems, item];
            return {
                ...prev,
                sharedItems: { ...prev.sharedItems, [category]: newItems },
            };
        });
    };

    // Handle form submission with mailto
    const handleSendInvitation = async () => {
        setLoading(true);
        try {
            const response = await addFamilyMember({ ...formData, sharedItems: formData.sharedItems, username });
            // console.log('addFamilyMember response:', response); // Debug log

            // Safely access response properties
            const responseData = response?.data || response; // Fallback to response if .data is undefined
            const status = responseData?.status ?? false;
            const responseMessage = responseData?.message ?? 'Unknown error';

            if (status) {
                // Save the form data via onSubmit
                onSubmit(formData);
                setPendingMember(formData);
                // Prepare and send email if method is Email
                if (formData.method === 'Email') {
                    // const subject = `Family Hub Invitation for ${formData.name}`;
                    // const sharedItemsList = Object.entries(formData.sharedItems)
                    //     .flatMap(([category, items]) => items.map(item => `${category}: ${item}`))
                    //     .join(', ');
                    // const body = `Dear ${formData.name},\n\nYou have been invited to join our Family Hub with the following access:\n- Relationship: ${formData.relationship.replace('❤️', '').replace('👶', '').replace('👴', '')}\n- Access Level: ${formData.permissions.type}\n- Shared Items: ${sharedItemsList || 'None'}\n\nPlease contact us to accept this invitation.\n\nBest regards,\n${username || 'Family Hub Team'}`;
                    // const encodedSubject = encodeURIComponent(subject);
                    // const encodedBody = encodeURIComponent(body);
                    // const mailtoLink = `mailto:${formData.email}?subject=${encodedSubject}&body=${encodedBody}`;

                    // try {
                    //     window.location.href = mailtoLink;
                    // } catch (mailError) {
                    //     console.error('Error opening mailto:', mailError);
                    //     notification.warning({
                    //         message: 'Email Client Issue',
                    //         description: 'Unable to open the email client, but the family member was added successfully.',
                    //         placement: 'topRight',
                    //         duration: 3,
                    //     });
                    // }
                }
                setStep('sent');
            } else {
                notification.error({
                    message: 'Error Adding Family Member',
                    description: responseMessage || 'Failed to add family member. Please try again.',
                    placement: 'topRight',
                    duration: 3,
                });
            }
        } catch (error) {
            console.error('Error in handleSendInvitation:', error);
            notification.error({
                message: 'Error Sending Invitation',
                description: 'Unable to process the invitation. Please try again.',
                placement: 'topRight',
                duration: 3,
            });
        } finally {
            setLoading(false);
        }
    };

    // Form validation
    const isFormValid = () => {
        return !!(
            formData.name &&
            formData.relationship &&
            (selectedMethod === 'Email' ? formData.email && validateEmail(formData.email) : true) &&
            (selectedMethod === 'Mobile' ? formData.phone && validatePhone(formData.phone) : true) &&
            (selectedMethod === 'Access Code' ? formData.accessCode : true)
        );
    };

    // Render functions
    const renderAddForm = () => (
        <div style={{ padding: '10px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>{isEditMode ? 'Edit Family Member' : 'Add Family Member'}</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {(['Email', 'Mobile', 'Access Code'] as const).map((method) => (
                    <Button
                        key={method}
                        type={selectedMethod === method ? 'primary' : 'default'}
                        onClick={() => {
                            setSelectedMethod(method);
                            setFormData((prev) => ({
                                ...prev,
                                method,
                                email: method === 'Email' ? prev.email : '',
                                phone: method === 'Mobile' ? prev.phone : '',
                                accessCode: method === 'Access Code' ? prev.accessCode : '',
                            }));
                        }}
                        style={{ borderRadius: '20px', padding: '5px 15px' }}
                    >
                        {method}
                    </Button>
                ))}
            </div>
            {selectedMethod === 'Email' && (
                <>
                    {!formData.email && <Text style={{ color: 'rgba(8, 20, 13, 0.95)' }}>Please enter an email address.</Text>}
                    <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        style={{ margin: '10px 0', borderRadius: '5px', padding: '10px' }}
                    />
                </>
            )}
            {selectedMethod === 'Mobile' && (
                <>
                    {!formData.phone && <Text style={{ color: 'rgba(8, 20, 13, 0.95)' }}>Please enter a phone number.</Text>}
                    {formData.phone && !validatePhone(formData.phone) && (
                        <Text style={{ color: 'red' }}>Please enter a valid phone number.</Text>
                    )}
                    <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        style={{ margin: '10px 0', borderRadius: '5px', padding: '10px' }}
                    />
                </>
            )}
            {selectedMethod === 'Access Code' && (
                <>
                    {!formData.accessCode && <Text style={{ color: 'rgba(8, 20, 13, 0.95)' }}>Please enter an access code.</Text>}
                    <Input
                        type="text"
                        name="accessCode"
                        value={formData.accessCode}
                        onChange={handleInputChange}
                        placeholder="Access Code"
                        style={{ margin: '10px 0', borderRadius: '5px', padding: '10px' }}
                    />
                </>
            )}
            {!formData.name && <Text style={{ color: 'rgba(8, 20, 13, 0.95)' }}>Please enter a display name.</Text>}
            <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Display Name"
                style={{ margin: '10px 0', borderRadius: '5px', padding: '10px' }}
            />
            <p style={{ margin: '10px 0 5px' }}>Select Relationship</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {['❤️Spouse/Partner', '👶Child', '👴Parent', 'Other'].map((rel) => (
                    <Button
                        key={rel}
                        type={formData.relationship === rel ? 'primary' : 'default'}
                        onClick={() => setFormData({ ...formData, relationship: rel })}
                        style={{ borderRadius: '20px', padding: '5px 15px' }}
                    >
                        {rel}
                    </Button>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <Button
                    onClick={onCancel}
                    style={{ borderRadius: '20px', padding: '5px 15px' }}
                >
                    Cancel
                </Button>
                <Button
                    type="primary"
                    disabled={!isFormValid()}
                    onClick={() => setStep('share')}
                    style={{ borderRadius: '20px', padding: '5px 15px' }}
                >
                    Continue
                </Button>
            </div>
        </div>
    );

    const renderPermissions = () => (
        <div style={{ padding: '10px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                Set Permissions for: {formData.name}
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
                {(['Full Access', 'Custom Access'] as const).map((type) => (
                    <Button
                        key={type}
                        type={formData.permissions.type === type ? 'primary' : 'default'}
                        onClick={() => handlePermissionTypeChange(type)}
                        style={{ borderRadius: '20px', padding: '5px 15px' }}
                    >
                        {type}
                    </Button>
                ))}
            </div>
            {formData.permissions.type === 'Custom Access' && (
                <div style={{ marginTop: '20px' }}>
                    {(['allowAdd', 'allowEdit', 'allowDelete', 'allowInvite', 'notify'] as const).map((key) => (
                        <div key={key} style={{ marginBottom: '8px' }}>
                            <Checkbox
                                checked={formData.permissions[key] ?? false}
                                onChange={() => handlePermissionChange(key)}
                            >
                                {key.replace('allow', 'Allow ').replace(/([A-Z])/g, ' $1')}
                            </Checkbox>
                        </div>
                    ))}
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <Button
                    onClick={() => setStep('add')}
                    style={{ borderRadius: '20px', padding: '5px 15px' }}
                >
                    Back
                </Button>
                <Button
                    type="primary"
                    onClick={() => setStep('share')}
                    style={{ borderRadius: '20px', padding: '5px 15px' }}
                >
                    Continue
                </Button>
            </div>
        </div>
    );

    const renderSharingOptions = () => {
        const hasSelectedItems = Object.values(formData.sharedItems).some((items) => items.length > 0);
        return (
            <div style={{ padding: '10px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                    Select What to Share with {formData.name}
                </h3>
                {Hubs.map(({ label, children }) => (
                    <div key={label.name} style={{ marginBottom: '20px' }}>
                        <Checkbox
                            checked={isParentChecked(label.name)}
                            onChange={(e) => toggleParent(label.name, e.target.checked)}
                            disabled={!children.length}
                        >
                            <span style={{ fontWeight: 'bold' }}>{label.title}</span>
                        </Checkbox>
                        {children.length > 0 && (
                            <div style={{ marginLeft: '20px' }}>
                                {children.map((child) => (
                                    <div key={child.name} style={{ margin: '5px 0' }}>
                                        <Checkbox
                                            checked={
                                                formData.sharedItems[label.name]?.includes(child.name) || false
                                            }
                                            onChange={() => toggleChild(label.name, child.name)}
                                        >
                                            {child.title}
                                        </Checkbox>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {!hasSelectedItems && (
                    <Text style={{ color: 'red', display: 'block', marginBottom: '10px' }}>
                        Please select at least one item to share before continuing.
                    </Text>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                    <Button
                        onClick={() => setStep('permissions')}
                        style={{ borderRadius: '20px', padding: '5px 15px' }}
                    >
                        Back
                    </Button>
                    <Button
                        type="primary"
                        disabled={!hasSelectedItems}
                        onClick={() => {
                            setPendingMember(formData);
                            setStep('review');
                        }}
                        style={{ borderRadius: '20px', padding: '5px 15px', backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        );
    };

    const renderReview = () => (
        <Card
            bordered={false}
            style={{
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                background: '#fff',
            }}
        >
            <Title level={4} style={{ marginBottom: 20 }}>
                🎯 Review Invitation
            </Title>

            <div style={{ marginBottom: 12 }}>
                <Text strong>To:</Text>{' '}
                <Text>
                    {formData.method === 'Email'
                        ? formData.email
                        : formData.method === 'Mobile'
                            ? formData.phone
                            : formData.accessCode}
                </Text>
            </div>

            <div style={{ marginBottom: 12 }}>
                <Text strong>Name:</Text> <Text>{formData.name}</Text>
            </div>

            <div style={{ marginBottom: 12 }}>
                <Text strong>Relationship:</Text>{' '}
                <Text>{formData.relationship.replace('❤️', '').replace('👶', '').replace('👴', '')}</Text>
            </div>

            <div style={{ marginBottom: 12 }}>
                <Text strong>Access:</Text> <Tag color="blue">{formData.permissions.type}</Tag>
            </div>

            {formData.permissions.type === 'Custom Access' && (
                <div style={{ marginBottom: 12 }}>
                    <Text strong>Permissions:</Text>{' '}
                    {[
                        formData.permissions.allowAdd && <Tag key="add">Add</Tag>,
                        formData.permissions.allowEdit && <Tag key="edit">Edit</Tag>,
                        formData.permissions.allowDelete && <Tag key="delete">Delete</Tag>,
                        formData.permissions.allowInvite && <Tag key="invite">Invite</Tag>,
                        formData.permissions.notify && <Tag key="notify">Notify</Tag>,
                    ].filter(Boolean).length > 0 ? (
                        <>{[
                            formData.permissions.allowAdd && <Tag key="add">Add</Tag>,
                            formData.permissions.allowEdit && <Tag key="edit">Edit</Tag>,
                            formData.permissions.allowDelete && <Tag key="delete">Delete</Tag>,
                            formData.permissions.allowInvite && <Tag key="invite">Invite</Tag>,
                            formData.permissions.notify && <Tag key="notify">Notify</Tag>,
                        ].filter(Boolean)}</>
                    ) : (
                        <Tag color="default">None</Tag>
                    )}
                </div>
            )}

            <Divider style={{ margin: '20px 0' }}>Shared Items</Divider>

            {Object.entries(formData.sharedItems).map(([categoryName, items]) => {
                const categoryData = Hubs.find((c) => c.label.name === categoryName);
                if (!categoryData || items.length === 0) return null;

                return (
                    <div key={categoryName} style={{ marginBottom: '16px' }}>
                        <Text strong style={{ fontSize: '16px', color: '#555' }}>
                            {categoryData.label.title}
                        </Text>
                        <ul style={{ paddingLeft: '20px', margin: '5px 0 0 0' }}>
                            {items.map((itemName) => {
                                const child = categoryData.children.find((c) => c.name === itemName);
                                return (
                                    <li key={`${categoryName}-${itemName}`} style={{ margin: '4px 0', fontSize: '14px' }}>
                                        {child?.title || itemName}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                );
            })}

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '30px',
                }}
            >
                <Button
                    onClick={() => setStep('share')}
                    style={{
                        borderRadius: '6px',
                        padding: '6px 20px',
                    }}
                >
                    ← Back
                </Button>
                <Button
                    type="primary"
                    onClick={handleSendInvitation}
                    loading={loading}
                    style={{
                        borderRadius: '6px',
                        padding: '6px 20px',
                        backgroundColor: '#1890ff',
                        borderColor: '#1890ff',
                    }}
                >
                    🚀 Send Invitation
                </Button>
            </div>
        </Card>
    );

    const renderSent = () => (
        <div style={{ textAlign: 'center', padding: '10px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Invitation Sent!</h3>
            <p style={{ marginBottom: '20px' }}>
                An invitation has been sent to {pendingMember?.name || 'the family member'}.
            </p>
            <Button
                type="primary"
                onClick={() => {
                    console.log('Done clicked, closing modal');
                    onCancel(); // Close the modal
                }}
                style={{ borderRadius: '20px', padding: '5px 15px', backgroundColor: '#1890ff', borderColor: '#1890ff' }}
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
            styles={{ body: { padding: '20px', borderRadius: '10px' } }}
        >
            {step === 'add' && renderAddForm()}
            {/* {step === 'permissions' && renderPermissions()} */}
            {step === 'share' && renderSharingOptions()}
            {step === 'review' && renderReview()}
            {step === 'sent' && renderSent()}
        </Modal>
    );
};

export default FamilyInviteForm;