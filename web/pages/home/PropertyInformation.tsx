'use client';
import React, { useState, useEffect } from 'react';
import { Card, List, Button, Space, Typography, Modal, Form, Input as AntInput, message, Avatar, Dropdown, Menu, DatePicker } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getProperties, addProperty, updateProperty, deleteProperty } from '../../services/home';

const { Text } = Typography;

const PRIMARY_COLOR = '#1b83e5ff';
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.1)';

interface Property {
    id: string;
    address: string;
    purchaseDate: string;
    purchasePrice: number;
    squareFootage: string;
    lotSize: string;
    propertyTaxId: string;
    is_active: number;
}

const PropertyInformation: React.FC = () => {
    const [propertiesData, setPropertiesData] = useState<Property[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isViewAllModalOpen, setIsViewAllModalOpen] = useState<boolean>(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [editForm] = Form.useForm();
    const [addForm] = Form.useForm();
    const [displayedPropertyIndex, setDisplayedPropertyIndex] = useState(0);

    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        console.log('Properties Data:', propertiesData);
    }, [propertiesData]);

    const fetchProperties = async () => {
        try {
            const response = await getProperties({});
            console.log('API Response:', response);
            if (response.status === 1) {
                const mappedProperties = response.payload.properties
                    .filter((prop: any) => prop.is_active === 1)
                    .map((prop: any) => ({
                        id: prop.id,
                        address: prop.address || 'N/A',
                        purchaseDate: prop.purchaseDate || prop.purchase_date || 'N/A',
                        purchasePrice: parseFloat(prop.purchasePrice || prop.purchase_price || 0),
                        squareFootage: prop.squareFootage || prop.square_footage || 'N/A',
                        lotSize: prop.lotSize || prop.lot_size || 'N/A',
                        propertyTaxId: prop.propertyTaxId || prop.property_tax_id || 'N/A',
                        is_active: prop.is_active || 1,
                    }));
                setPropertiesData(mappedProperties);
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error('Failed to fetch properties');
            console.error('Fetch Properties Error:', error);
        }
    };

    const handleEdit = (property: Property) => {
        setEditingProperty(property);
        editForm.setFieldsValue({
            address: property.address,
            purchaseDate: property.purchaseDate && property.purchaseDate !== 'N/A' ? moment(property.purchaseDate, 'YYYY-MM-DD') : null,
            purchasePrice: property.purchasePrice.toString(),
            squareFootage: property.squareFootage,
            lotSize: property.lotSize,
            propertyTaxId: property.propertyTaxId,
        });
        setIsEditModalOpen(true);
    };

    const handleEditOk = () => {
        editForm.validateFields().then(async (values) => {
            if (editingProperty) {
                try {
                    console.log('Edit Form Values:', values);
                    const response = await updateProperty(editingProperty.id, {
                        address: values.address,
                        purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : '',
                        purchasePrice: parseFloat(values.purchasePrice),
                        squareFootage: values.squareFootage,
                        lotSize: values.lotSize,
                        propertyTaxId: values.propertyTaxId,
                    });
                    console.log('Update API Response:', response);
                    if (response.status === 1) {
                        setPropertiesData(
                            propertiesData.map((item) =>
                                item.id === editingProperty.id ? response.payload.property : item
                            )
                        );
                        setIsEditModalOpen(false);
                        editForm.resetFields();
                        setEditingProperty(null);
                        message.success('Property updated successfully!');
                    } else {
                        message.error(response.message);
                    }
                } catch (error) {
                    message.error('Failed to update property');
                    console.error('Update Property Error:', error);
                }
            }
        });
    };

    const handleAddOk = () => {
        addForm.validateFields().then(async (values) => {
            try {
                console.log('Add Form Values:', values);
                const response = await addProperty({
                    address: values.address,
                    purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : '',
                    purchasePrice: parseFloat(values.purchasePrice),
                    squareFootage: values.squareFootage,
                    lotSize: values.lotSize,
                    propertyTaxId: values.propertyTaxId,
                });
                console.log('Add API Response:', response);
                if (response.status === 1) {
                    setPropertiesData([...propertiesData, response.payload.property]);
                    setIsAddModalOpen(false);
                    addForm.resetFields();
                    message.success('Property added successfully!');
                } else {
                    message.error(response.message);
                }
            } catch (error) {
                message.error('Failed to add property');
                console.error('Add Property Error:', error);
            }
        });
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Are you sure you want to deactivate this property?',
            onOk: async () => {
                try {
                    const response = await deleteProperty(id);
                    console.log('Delete API Response:', response);
                    if (response.status === 1 && response.payload.property.is_active === 0) {
                        setPropertiesData(propertiesData.filter((item) => item.id !== id));
                        message.success('Property deactivated successfully!');
                    } else {
                        message.error(response.message || 'Failed to deactivate property');
                    }
                } catch (error) {
                    message.error('Failed to deactivate property');
                    console.error('Delete Property Error:', error);
                }
            },
        });
    };

    const handleEditCancel = () => {
        setIsEditModalOpen(false);
        editForm.resetFields();
        setEditingProperty(null);
    };

    const handleAddCancel = () => {
        setIsAddModalOpen(false);
        addForm.resetFields();
    };

    const handleViewAllCancel = () => {
        setIsViewAllModalOpen(false);
    };

    const renderForm = (form: any, isEdit: boolean) => (
        <Form form={form} layout="vertical">
            <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please enter address!' }]}
            >
                <AntInput style={{ padding: '5px', borderRadius: '4px' }} placeholder="Enter address" />
            </Form.Item>
            <Form.Item
                name="purchaseDate"
                label="Purchase Date"
                rules={[{ required: true, message: 'Please select purchase date!' }]}
            >
                <DatePicker
                    style={{ width: '100%', padding: '5px', borderRadius: '4px' }}
                    format="YYYY-MM-DD"
                    placeholder="Select date"
                />
            </Form.Item>
            <Form.Item
                name="purchasePrice"
                label="Purchase Price ($)"
                rules={[
                    { required: true, message: 'Please enter purchase price!' },
                    { pattern: /^\d+(\.\d{1,2})?$/, message: 'Please enter a valid amount (e.g., 285000.00)' },
                ]}
            >
                <AntInput style={{ padding: '5px', borderRadius: '4px' }} placeholder="Enter purchase price" />
            </Form.Item>
            <Form.Item
                name="squareFootage"
                label="Square Footage"
                rules={[{ required: true, message: 'Please enter square footage!' }]}
            >
                <AntInput style={{ padding: '5px', borderRadius: '4px' }} placeholder="Enter square footage" />
            </Form.Item>
            <Form.Item
                name="lotSize"
                label="Lot Size"
                rules={[{ required: true, message: 'Please enter lot size!' }]}
            >
                <AntInput style={{ padding: '5px', borderRadius: '4px' }} placeholder="Enter lot size" />
            </Form.Item>
            <Form.Item
                name="propertyTaxId"
                label="Property Tax ID"
                rules={[{ required: true, message: 'Please enter property tax ID!' }]}
            >
                <AntInput style={{ padding: '5px', borderRadius: '4px' }} placeholder="Enter property tax ID" />
            </Form.Item>
        </Form>
    );

    const menu = (property: Property) => (
        <Menu>
            <Menu.Item key="edit" onClick={() => handleEdit(property)}>
                Edit
            </Menu.Item>
            <Menu.Item key="delete" onClick={() => handleDelete(property.id)} style={{ color: '#ff4d4f' }}>
                Delete
            </Menu.Item>
        </Menu>
    );

    const renderPropertyTable = (property: Property) => (
        <table style={{ width: '100%', backgroundColor: '#f5f5f5', borderCollapse: 'collapse' }}>
            <tbody>
                <tr style={{ borderBottom: '1px solid #d9d9d9' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>Address</td>
                    <td style={{ padding: '8px' }}>{property.address}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #d9d9d9' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>Purchase Date</td>
                    <td style={{ padding: '8px' }}>{property.purchaseDate || 'N/A'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #d9d9d9' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>Purchase Price</td>
                    <td style={{ padding: '8px' }}>{property.purchasePrice ? `$${property.purchasePrice.toFixed(2)}` : 'N/A'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #d9d9d9' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>Square Footage</td>
                    <td style={{ padding: '8px' }}>{property.squareFootage || 'N/A'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #d9d9d9' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>Lot Size</td>
                    <td style={{ padding: '8px' }}>{property.lotSize || 'N/A'}</td>
                </tr>
                <tr>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>Property Tax ID</td>
                    <td style={{ padding: '8px' }}>{property.propertyTaxId || 'N/A'}</td>
                </tr>
            </tbody>
        </table>
    );

    return (
        <>
            <Card
                title={
                    <span>
                        <span style={{ marginRight: '8px' }}>🏠</span> Property Information
                    </span>
                }
                extra={
                    <Space>
                        <Button
                            type="default"
                            onClick={() => setIsAddModalOpen(true)}
                            style={{ borderColor: '#d9d9d9', backgroundColor: 'transparent' }}
                        >
                            <PlusOutlined /> Add
                        </Button>
                    </Space>
                }
                style={{
                    marginBottom: '24px',
                    borderRadius: '16px',
                    border: '1px solid #d9d9d9',
                    minHeight: '450px',
                    maxHeight: '600px',
                    overflowY: propertiesData.length > 1 ? 'auto' : 'hidden',
                    backgroundColor: '#f5f5f5',
                }}
                bodyStyle={{
                    padding: propertiesData.length === 0 ? '24px' : '16px',
                }}
            >
                {propertiesData.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#888' }}>
                        <Text>No properties available. Click "Add" to create a new property.</Text>
                    </div>
                ) : (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: '16px', fontWeight: 'bold' }}>
                            {displayedPropertyIndex + 1} / {propertiesData.length}
                        </div>
                        {renderPropertyTable(propertiesData[displayedPropertyIndex])}
                        {propertiesData.length > 1 && (
                            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                                <Button
                                    type="default"
                                    onClick={() =>
                                        setDisplayedPropertyIndex((prev) => (prev > 0 ? prev - 1 : propertiesData.length - 1))
                                    }
                                    style={{ marginRight: '8px' }}
                                >
                                    Previous
                                </Button>
                                <Button
                                    type="default"
                                    onClick={() =>
                                        setDisplayedPropertyIndex((prev) => (prev + 1) % propertiesData.length)
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                        {propertiesData.length > 1 && (
                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <Button
                                    type="default"
                                    onClick={() => setIsViewAllModalOpen(true)}
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        color: '#fff',
                                        borderRadius: '4px',
                                        border: 'none',
                                    }}
                                >
                                    View All Properties ({propertiesData.length})
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            <Modal
                title="Edit Property"
                open={isEditModalOpen}
                onOk={handleEditOk}
                onCancel={handleEditCancel}
                okText="Save"
                cancelText="Cancel"
            >
                {renderForm(editForm, true)}
            </Modal>

            <Modal
                title="Add Property"
                open={isAddModalOpen}
                onOk={handleAddOk}
                onCancel={handleAddCancel}
                okText="Add"
                cancelText="Cancel"
            >
                {renderForm(addForm, false)}
            </Modal>

            <Modal
                title="All Properties"
                open={isViewAllModalOpen}
                onCancel={handleViewAllCancel}
                footer={[
                    <Button key="close" onClick={handleViewAllCancel}>
                        Close
                    </Button>,
                ]}
                width={800}
                bodyStyle={{
                    maxHeight: '500px',
                    overflowY: 'auto',
                }}
            >
                <div>
                    {propertiesData.map((property, index) => (
                        <div key={property.id} style={{ marginBottom: '16px' }}>
                            <h3 style={{ marginBottom: '8px' }}>Property {index + 1}</h3>
                            {renderPropertyTable(property)}
                        </div>
                    ))}
                </div>
            </Modal>
        </>
    );
};

export default PropertyInformation;