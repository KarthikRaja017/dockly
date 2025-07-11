'use client';
import React, { useState, useEffect } from 'react';
import { Card, List, Button, Space, Typography, Modal, Form, Input as AntInput, message, Avatar, Dropdown, Menu } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { addProperty, getProperties, updateProperty, deleteProperty } from '../../services/home';

const { Text } = Typography;

const PRIMARY_COLOR = '#1890ff';
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

    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        console.log('Properties Data:', propertiesData); // Debug state changes
    }, [propertiesData]);

    const fetchProperties = async () => {
        try {
            const response = await getProperties({});
            console.log('API Response:', response); // Debug API response
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
            purchaseDate: property.purchaseDate,
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
                        purchaseDate: values.purchaseDate,
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
                    purchaseDate: values.purchaseDate,
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
                label="Purchase Date (YYYY-MM-DD)"
                rules={[
                    { required: true, message: 'Please enter purchase date!' },
                    { pattern: /^\d{4}-\d{2}-\d{2}$/, message: 'Please use YYYY-MM-DD format!' },
                ]}
            >
                <AntInput style={{ padding: '5px', borderRadius: '4px' }} placeholder="YYYY-MM-DD" />
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
                Deactivate
            </Menu.Item>
        </Menu>
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
                    boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
                    border: '1px solid #d9d9d9',
                    // Remove fixed height, let content drive size
                    minHeight: '200px', // Minimum height to avoid looking too small when empty
                    maxHeight: '500px', // Maximum height to prevent excessive growth
                    overflowY: propertiesData.length > 4 ? 'auto' : 'hidden', // Scroll if more than 4 items
                }}
                bodyStyle={{
                    padding: propertiesData.length === 0 ? '24px' : '16px', // Adjust padding based on content
                }}
            >
                {propertiesData.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#888' }}>
                        <Text>No properties available. Click "Add" to create a new property.</Text>
                    </div>
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={propertiesData.slice(0, 4)}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Dropdown overlay={menu(item)} trigger={['click']}>
                                        <Button
                                            size="small"
                                            style={{
                                                borderColor: '#d9d9d9',
                                                backgroundColor: 'transparent',
                                                borderRadius: '4px',
                                                padding: '0 8px',
                                            }}
                                        >
                                            <MoreOutlined />
                                        </Button>
                                    </Dropdown>,
                                ]}
                                style={{
                                    borderBottom: '1px solid #f0f0f0',
                                    padding: '8px 0',
                                    // Ensure consistent item height
                                    minHeight: '60px',
                                }}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar style={{ backgroundColor: PRIMARY_COLOR, borderRadius: '50%' }}>{item.address[0]}</Avatar>}
                                    title={<Text style={{ fontWeight: 'bold' }}>{item.address}</Text>}
                                    description={
                                        <div>
                                            <Text>
                                                Purchase Date: {item.purchaseDate || 'N/A'} •
                                                Purchase Price: {item.purchasePrice ? `$${item.purchasePrice.toFixed(2)}` : 'N/A'} •
                                                Square Footage: {item.squareFootage || 'N/A'} •
                                                Lot Size: {item.lotSize || 'N/A'} •
                                                Property Tax ID: {item.propertyTaxId || 'N/A'}
                                            </Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
                {propertiesData.length > 4 && (
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
                    overflowY: 'auto', // Scroll for long lists in the modal
                }}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={propertiesData}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Dropdown overlay={menu(item)} trigger={['click']}>
                                    <Button
                                        size="small"
                                        style={{
                                            borderColor: '#d9d9d9',
                                            backgroundColor: 'transparent',
                                            borderRadius: '4px',
                                            padding: '0 8px',
                                        }}
                                    >
                                        <MoreOutlined />
                                    </Button>
                                </Dropdown>,
                            ]}
                            style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 0' }}
                        >
                            <List.Item.Meta
                                avatar={<Avatar style={{ backgroundColor: PRIMARY_COLOR, borderRadius: '50%' }}>{item.address[0]}</Avatar>}
                                title={<Text style={{ fontWeight: 'bold' }}>{item.address}</Text>}
                                description={
                                    <div>
                                        <Text>
                                            Purchase Date: {item.purchaseDate || 'N/A'} •
                                            Purchase Price: {item.purchasePrice ? `$${item.purchasePrice.toFixed(2)}` : 'N/A'} •
                                            Square Footage: {item.squareFootage || 'N/A'} •
                                            Lot Size: {item.lotSize || 'N/A'} •
                                            Property Tax ID: {item.propertyTaxId || 'N/A'}
                                        </Text>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Modal>
        </>
    );
};

export default PropertyInformation;