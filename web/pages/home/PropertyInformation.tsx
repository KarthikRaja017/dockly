// import React, { useState, useCallback, useEffect } from 'react';
// import { Card, Form, Input, Button, DatePicker, Space, Typography, Alert, AutoComplete, Spin, Modal } from 'antd';
// import { MapPin, Search, Home, Calendar, DollarSign, Ruler, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
// import axios from 'axios';
// import moment from 'moment';
// import { addProperty, getProperties, updateProperty } from '../../services/home'; // Importing from home.ts

// const { Title, Text } = Typography;

// // Geopify Types and Service
// interface GeopifyFeature {
//     properties: {
//         formatted: string;
//         address_line1?: string;
//         address_line2?: string;
//         housenumber?: string;
//         house_number?: string;
//         name?: string;
//         building?: string;
//         lat?: number;
//         lon?: number;
//         result_type?: string;
//         type?: string;
//         rank?: {
//             confidence?: number;
//         };
//     };
//     geometry: {
//         coordinates: [number, number];
//     };
// }

// interface GeopifyResponse {
//     features: GeopifyFeature[];
// }

// interface AddressDetails {
//     formatted: string;
//     latitude: number;
//     longitude: number;
// }

// interface PropertyData {
//     id: string;
//     address: string;
//     purchaseDate: string;
//     purchasePrice: number;
//     squareFootage: string;
//     lotSize: string;
//     propertyTaxId: string;
//     is_active: number;
// }

// // Geopify Service
// const GEOPIFY_API_KEY = 'ea55e68bab7b4b26a0104dfbbeeaaf7b';
// const GEOPIFY_BASE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';

// class GeopifyService {
//     static async searchAddresses(query: string, limit: number = 10): Promise<GeopifyResponse> {
//         try {
//             const response = await axios.get(GEOPIFY_BASE_URL, {
//                 params: {
//                     text: query,
//                     limit,
//                     apiKey: GEOPIFY_API_KEY,
//                     format: 'geojson'
//                 },
//                 timeout: 10000
//             });
//             return response.data;
//         } catch (error) {
//             console.error('Error fetching addresses:', error);
//             throw new Error('API Error: ' + (error as Error).message);
//         }
//     }
// }

// const PropertyInformation: React.FC = () => {
//     const [form] = Form.useForm();
//     const [loading, setLoading] = useState(false);
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [properties, setProperties] = useState<PropertyData[]>([]);
//     const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
//     const [modalTitle, setModalTitle] = useState('Add New Property');
//     const [errorMessage, setErrorMessage] = useState<string>('');
//     const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);

//     // Address Autocomplete State
//     const [addressOptions, setAddressOptions] = useState<any[]>([]);
//     const [addressLoading, setAddressLoading] = useState(false);
//     const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
//     const [addressSearchValue, setAddressSearchValue] = useState('');

//     // Fetch properties on component mount
//     useEffect(() => {
//         const fetchProperties = async () => {
//             setLoading(true);
//             try {
//                 const response = await getProperties({});
//                 if (response.status === 1) {
//                     setProperties(response.payload.properties);
//                     setCurrentPropertyIndex(0); // Reset to first property
//                 } else {
//                     setErrorMessage(response.message);
//                 }
//             } catch (error) {
//                 console.error('Error fetching properties:', error);
//                 setErrorMessage('Failed to fetch properties');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchProperties();
//     }, []);

//     // Debounce function
//     const debounce = (func: Function, delay: number) => {
//         let timeoutId: NodeJS.Timeout;
//         return (...args: any[]) => {
//             clearTimeout(timeoutId);
//             timeoutId = setTimeout(() => func.apply(null, args), delay);
//         };
//     };

//     // Address search function
//     const searchAddresses = useCallback(
//         debounce(async (value: string) => {
//             if (!value || value.length < 3) {
//                 setAddressOptions([]);
//                 return;
//             }

//             setAddressLoading(true);
//             setErrorMessage('');

//             try {
//                 const response = await GeopifyService.searchAddresses(value);

//                 const formattedOptions = response.features.map((feature: GeopifyFeature, index: number) => {
//                     const props = feature.properties;
//                     const houseNumber = props.housenumber || props.house_number || '';
//                     const building = props.name || props.building || '';

//                     return {
//                         key: index,
//                         value: feature.properties.formatted || 'No formatted address',
//                         label: (
//                             <div style={{
//                                 padding: '8px 0',
//                                 borderBottom: index < response.features.length - 1 ? '1px solid #f0f0f0' : 'none'
//                             }}>
//                                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
//                                     <MapPin size={16} style={{ color: '#1890ff', flexShrink: 0 }} />
//                                     <Text strong style={{ fontSize: '14px' }}>{feature.properties.formatted}</Text>
//                                 </div>
//                                 {(houseNumber || building) && (
//                                     <div style={{ padding: '24px', marginBottom: '2px' }}>
//                                         <Text type="secondary" style={{ fontSize: '11px' }}>
//                                             {houseNumber && `House: ${houseNumber}`}
//                                             {houseNumber && building && ' • '}
//                                             {building && `Building: ${building}`}
//                                         </Text>
//                                     </div>
//                                 )}
//                             </div>
//                         ),
//                         feature
//                     };
//                 });

//                 setAddressOptions(formattedOptions);
//             } catch (err) {
//                 const errorMessage = err instanceof Error ? err.message : 'Failed to fetch addresses. Please try again.';
//                 setErrorMessage(errorMessage);
//                 setAddressOptions([]);
//             } finally {
//                 setAddressLoading(false);
//             }
//         }, 300),
//         []
//     );

//     // Handle address search
//     const handleAddressSearch = (value: string) => {
//         setAddressSearchValue(value);
//         searchAddresses(value);
//     };

//     // Handle address selection
//     const handleAddressSelect = (value: string, option: any) => {
//         const feature: GeopifyFeature = option.feature;
//         const props = feature.properties;

//         const addressDetails: AddressDetails = {
//             formatted: props.formatted || value,
//             latitude: props.lat || feature.geometry.coordinates[1],
//             longitude: props.lon || feature.geometry.coordinates[0]
//         };

//         setSelectedAddress(addressDetails);
//         setAddressSearchValue(value);

//         // Auto-fill form fields
//         form.setFieldsValue({
//             address: addressDetails.formatted
//         });
//     };

//     // Handle edit button click
//     const handleEdit = (property: PropertyData) => {
//         setEditingPropertyId(property.id);
//         setModalTitle('Edit Property');
//         setIsModalVisible(true);
//         setAddressSearchValue(property.address);

//         // Populate form with existing property data
//         form.setFieldsValue({
//             address: property.address,
//             purchaseDate: property.purchaseDate ? moment(property.purchaseDate) : null,
//             purchasePrice: property.purchasePrice,
//             squareFootage: property.squareFootage,
//             lotSize: property.lotSize,
//             propertyTaxId: property.propertyTaxId
//         });

//         setSelectedAddress({
//             formatted: property.address,
//             latitude: 0,
//             longitude: 0
//         });
//     };

//     // Handle carousel navigation
//     const handlePrevious = () => {
//         setCurrentPropertyIndex(prev => (prev === 0 ? properties.length - 1 : prev - 1));
//     };

//     const handleNext = () => {
//         setCurrentPropertyIndex(prev => (prev === properties.length - 1 ? 0 : prev + 1));
//     };

//     const handleSubmit = async (values: any) => {
//         setLoading(true);
//         setErrorMessage('');
//         try {
//             const propertyData = {
//                 address: values.address,
//                 purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : '',
//                 purchasePrice: Number(values.purchasePrice),
//                 squareFootage: values.squareFootage,
//                 lotSize: values.lotSize,
//                 propertyTaxId: values.propertyTaxId
//             };

//             let response: { status: number; payload: { property: PropertyData; }; message: React.SetStateAction<string>; };
//             if (editingPropertyId) {
//                 // Update existing property
//                 response = await updateProperty(editingPropertyId, propertyData);
//                 if (response.status === 1) {
//                     setProperties(prev =>
//                         prev.map(p => (p.id === editingPropertyId ? response.payload.property : p))
//                     );
//                 }
//             } else {
//                 // Add new property
//                 response = await addProperty(propertyData);
//                 if (response.status === 1) {
//                     setProperties(prev => [...prev, response.payload.property]);
//                     setCurrentPropertyIndex(properties.length); // Set to the newly added property
//                 }
//             }

//             if (response.status === 1) {
//                 setIsModalVisible(false);
//                 form.resetFields();
//                 setSelectedAddress(null);
//                 setAddressOptions([]);
//                 setAddressSearchValue('');
//                 setEditingPropertyId(null);
//                 setModalTitle('Add New Property');
//             } else {
//                 setErrorMessage(response.message);
//             }
//         } catch (error) {
//             console.error('Error saving property:', error);
//             setErrorMessage('Error saving property information');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div style={{
//             padding: '24px 16px',
//             minHeight: '450px',
//             marginTop: '-26px',
//             maxHeight: 'calc(100vh - 64px)',
//             fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
//         }}>
//             <div style={{ width: '600px', margin: '0 auto' }}>
//                 <Card
//                     title={
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                             <Home size={24} style={{ color: '#1890ff' }} />
//                             <Title level={3} style={{ margin: 0, color: '#080c0fff' }}>
//                                 Property Information
//                             </Title>
//                         </div>
//                     }
//                     extra={
//                         <Button
//                             icon={<span style={{ fontSize: '26px', lineHeight: '20px', color: 'white' }}>+</span>}
//                             onClick={() => {
//                                 setModalTitle('Add New Property');
//                                 setIsModalVisible(true);
//                                 setEditingPropertyId(null);
//                                 form.resetFields();
//                                 setSelectedAddress(null);
//                                 setAddressSearchValue('');
//                             }}
//                             style={{ border: '1px solid #1890ff', color: '#1890ff', backgroundColor: '#1890ff' }}
//                         />
//                     }
//                     style={{
//                         borderRadius: '16px',
//                         boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
//                         border: 'none',
//                         background: '#ffffff',
//                         minHeight: '450px',
//                     }}
//                 >
//                     {loading && (
//                         <div style={{ textAlign: 'center', padding: '40px 0' }}>
//                             <Spin size="large" />
//                         </div>
//                     )}
//                     {!loading && properties.length === 0 ? (
//                         <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
//                             <Home size={40} style={{ color: '#ccc', marginBottom: '16px' }} />
//                             <p>No properties available. Click "Add" to create a new property.</p>
//                         </div>
//                     ) : (
//                         <div style={{ padding: '16px 0' }}>
//                             {properties.length > 0 && (
//                                 <Card
//                                     key={properties[currentPropertyIndex].id}
//                                     title={
//                                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
//                                                 <MapPin size={16} style={{ color: '#52c41a', flexShrink: 0 }} />
//                                                 <Text strong style={{ fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                                                     {properties[currentPropertyIndex].address}
//                                                 </Text>
//                                             </div>
//                                             <Button
//                                                 icon={<Edit size={16} />}
//                                                 onClick={() => handleEdit(properties[currentPropertyIndex])}
//                                                 style={{ border: 'none', marginLeft: '8px' }}
//                                             >
//                                                 {/* Edit */}
//                                             </Button>
//                                         </div>
//                                     }
//                                     style={{ marginBottom: '16px', borderRadius: '8px', border: '1px solid #e8e8e8' }}
//                                 >
//                                     <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                                         <div>
//                                             <Text type="secondary" style={{ color: 'black', fontSize: '16px' }}>Address:</Text>
//                                             <Text style={{ display: 'block' }}>{properties[currentPropertyIndex].address}</Text>
//                                         </div>
//                                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
//                                             <div>
//                                                 <Text type="secondary" style={{ color: 'black', fontSize: '16px' }}>Purchase Date-</Text>
//                                                 <Text>{properties[currentPropertyIndex].purchaseDate}</Text>
//                                             </div>
//                                             <div>
//                                                 <Text type="secondary" style={{ color: 'black', fontSize: '16px' }}>Purchase Price-</Text>
//                                                 <Text>${properties[currentPropertyIndex].purchasePrice}</Text>
//                                             </div>
//                                             <div>
//                                                 <Text type="secondary" style={{ color: 'black', fontSize: '16px' }}>Square Footage-</Text>
//                                                 <Text >{properties[currentPropertyIndex].squareFootage} sq-ft</Text>
//                                             </div>
//                                             <div>
//                                                 <Text type="secondary" style={{ color: 'black', fontSize: '16px' }}>Lot Size-</Text>
//                                                 <Text>{properties[currentPropertyIndex].lotSize} acres</Text>
//                                             </div>
//                                             <div>
//                                                 <Text type="secondary" style={{ color: 'black', fontSize: '16px' }}>Tax ID-</Text>
//                                                 <Text>{properties[currentPropertyIndex].propertyTaxId}</Text>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </Card>
//                             )}
//                             {properties.length > 1 && (
//                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
//                                     <div style={{ textAlign: 'center', flex: 1 }}>
//                                         <Text strong>{` ${currentPropertyIndex + 1} / ${properties.length}`}</Text>
//                                     </div>
//                                     <Space>
//                                         <Button
//                                             icon={<ChevronLeft size={16} />}
//                                             onClick={handlePrevious}
//                                             disabled={properties.length <= 1}
//                                             style={{ borderRadius: '8px' }}
//                                         >

//                                         </Button>
//                                         <Button
//                                             icon={<ChevronRight size={16} />}
//                                             onClick={handleNext}
//                                             disabled={properties.length <= 1}
//                                             style={{ borderRadius: '8px' }}
//                                         >

//                                         </Button>
//                                     </Space>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                     {errorMessage && (
//                         <Alert
//                             message="Error"
//                             description={errorMessage}
//                             type="error"
//                             showIcon
//                             closable
//                             onClose={() => setErrorMessage('')}
//                             style={{ marginTop: '16px' }}
//                         />
//                     )}
//                 </Card>

//                 <Modal
//                     title={
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                             <Home size={24} style={{ color: '#1890ff' }} />
//                             <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
//                                 {modalTitle}
//                             </Title>
//                         </div>
//                     }
//                     open={isModalVisible}
//                     onCancel={() => {
//                         setIsModalVisible(false);
//                         form.resetFields();
//                         setSelectedAddress(null);
//                         setAddressOptions([]);
//                         setAddressSearchValue('');
//                         setEditingPropertyId(null);
//                         setModalTitle('Add New Property');
//                         setErrorMessage('');
//                     }}
//                     footer={null}
//                     width={800}
//                     style={{ top: 20 }}
//                     bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
//                 >
//                     <Form
//                         form={form}
//                         layout="vertical"
//                         onFinish={handleSubmit}
//                         style={{ width: '100%' }}
//                     >
//                         {/* Address Autocomplete Section */}
//                         <div style={{ marginBottom: '24px' }}>
//                             <Form.Item
//                                 label="Property Address"
//                                 name="address"
//                                 rules={[{ required: true, message: 'Please enter the property address' }]}
//                             >
//                                 <AutoComplete
//                                     style={{ width: '100%' }}
//                                     options={addressOptions}
//                                     onSearch={handleAddressSearch}
//                                     onSelect={handleAddressSelect}
//                                     value={addressSearchValue}
//                                     placeholder=" (e.g., 123 Main Street, New York)"
//                                     size="large"
//                                     notFoundContent={
//                                         addressLoading ? (
//                                             <div style={{ textAlign: 'center', padding: '8px' }}>
//                                                 <Spin size="small" /> Searching worldwide...
//                                             </div>
//                                         ) : 'No addresses found'
//                                     }
//                                     dropdownStyle={{
//                                         borderRadius: '8px',
//                                         boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
//                                         border: '1px solid #e8e8e8'
//                                     }}
//                                 >
//                                     <Input
//                                         prefix={<Search size={16} style={{ color: '#bfbfbf' }} />}
//                                         suffix={addressLoading ? <Spin size="small" /> : null}
//                                         style={{ borderRadius: '8px', border: '2px solid #e8e8e8', transition: 'all 0.3s ease' }}
//                                     />
//                                 </AutoComplete>
//                             </Form.Item>

//                             {errorMessage && (
//                                 <Alert
//                                     message="Address Search Error"
//                                     description={errorMessage}
//                                     type="error"
//                                     showIcon
//                                     closable
//                                     onClose={() => setErrorMessage('')}
//                                     style={{ marginTop: '8px' }}
//                                 />
//                             )}
//                         </div>

//                         {/* Property Details Form */}
//                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
//                             <Form.Item
//                                 label={
//                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                         <Calendar size={16} style={{ color: '#1890ff' }} />
//                                         <span>Purchase Date</span>
//                                     </div>
//                                 }
//                                 name="purchaseDate"
//                                 rules={[{ required: true, message: 'Please select purchase date' }]}
//                             >
//                                 <DatePicker
//                                     style={{ width: '100%' }}
//                                     size="large"
//                                     placeholder="Select purchase date"
//                                 />
//                             </Form.Item>

//                             <Form.Item
//                                 label={
//                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                         <DollarSign size={16} style={{ color: '#1890ff' }} />
//                                         <span>Purchase Price</span>
//                                     </div>
//                                 }
//                                 name="purchasePrice"
//                                 rules={[{ required: true, message: 'Please enter purchase price' }]}
//                             >
//                                 <Input
//                                     size="large"
//                                     placeholder="Enter purchase price"
//                                     prefix="$"
//                                     type="number"
//                                 />
//                             </Form.Item>

//                             <Form.Item
//                                 label={
//                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                         <Ruler size={16} style={{ color: '#1890ff' }} />
//                                         <span>Square Footage</span>
//                                     </div>
//                                 }
//                                 name="squareFootage"
//                                 rules={[{ required: true, message: 'Please enter square footage' }]}
//                             >
//                                 <Input
//                                     size="large"
//                                     placeholder="Enter square footage"
//                                     suffix="sq ft"
//                                     type="text"
//                                 />
//                             </Form.Item>

//                             <Form.Item
//                                 label={
//                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                         <Ruler size={16} style={{ color: '#1890ff' }} />
//                                         <span>Lot Size</span>
//                                     </div>
//                                 }
//                                 name="lotSize"
//                                 rules={[{ required: true, message: 'Please enter lot size' }]}
//                             >
//                                 <Input
//                                     size="large"
//                                     placeholder="Enter lot size"
//                                     suffix="acres"
//                                     type="text"
//                                 />
//                             </Form.Item>

//                             <Form.Item
//                                 label="Property Tax ID"
//                                 name="propertyTaxId"
//                                 rules={[{ required: true, message: 'Please enter property tax ID' }]}
//                             >
//                                 <Input
//                                     size="large"
//                                     placeholder="Enter property tax ID"
//                                 />
//                             </Form.Item>
//                         </div>

//                         {/* Submit Button */}
//                         <Form.Item>
//                             <Button
//                                 type="primary"
//                                 htmlType="submit"
//                                 loading={loading}
//                                 size="large"
//                                 style={{
//                                     width: '100%',
//                                     height: '50px',
//                                     borderRadius: '8px',
//                                     fontSize: '16px',
//                                     fontWeight: '600',
//                                     background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
//                                     border: 'none',
//                                     boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
//                                 }}
//                             >
//                                 {loading ? 'Saving Property...' : editingPropertyId ? 'Update Property' : 'Save Property Information'}
//                             </Button>
//                         </Form.Item>
//                     </Form>
//                 </Modal>
//             </div>
//         </div>
//     );
// };

// export default PropertyInformation;

import React, { useState, useCallback, useEffect } from 'react';
import { Card, Form, Input, Button, DatePicker, Space, Typography, Alert, AutoComplete, Spin, Modal } from 'antd';
import { MapPin, Search, Home, Calendar, DollarSign, Ruler, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import moment from 'moment';
import { addProperty, getProperties, updateProperty } from '../../services/home'; // Importing from home.ts

const { Title, Text } = Typography;

// Geopify Types and Service
interface GeopifyFeature {
    properties: {
        formatted: string;
        address_line1?: string;
        address_line2?: string;
        housenumber?: string;
        house_number?: string;
        name?: string;
        building?: string;
        lat?: number;
        lon?: number;
        result_type?: string;
        type?: string;
        rank?: {
            confidence?: number;
        };
    };
    geometry: {
        coordinates: [number, number];
    };
}

interface GeopifyResponse {
    features: GeopifyFeature[];
}

interface AddressDetails {
    formatted: string;
    latitude: number;
    longitude: number;
}

interface PropertyData {
    id: string;
    address: string;
    purchaseDate: string;
    purchasePrice: number;
    squareFootage: string;
    lotSize: string;
    propertyTaxId: string;
    is_active: number;
}

// Geopify Service
const GEOPIFY_API_KEY = 'ea55e68bab7b4b26a0104dfbbeeaaf7b';
const GEOPIFY_BASE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';

class GeopifyService {
    static async searchAddresses(query: string, limit: number = 10): Promise<GeopifyResponse> {
        try {
            const response = await axios.get(GEOPIFY_BASE_URL, {
                params: {
                    text: query,
                    limit,
                    apiKey: GEOPIFY_API_KEY,
                    format: 'geojson'
                },
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching addresses:', error);
            throw new Error('API Error: ' + (error as Error).message);
        }
    }
}

const PropertyInformation: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [properties, setProperties] = useState<PropertyData[]>([]);
    const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
    const [modalTitle, setModalTitle] = useState('Add New Property');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);

    // Address Autocomplete State
    const [addressOptions, setAddressOptions] = useState<any[]>([]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
    const [addressSearchValue, setAddressSearchValue] = useState('');

    // Fetch properties on component mount
    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                const response = await getProperties({});
                if (response.status === 1) {
                    setProperties(response.payload.properties);
                    setCurrentPropertyIndex(0); // Reset to first property
                } else {
                    setErrorMessage(response.message);
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
                setErrorMessage('Failed to fetch properties');
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    // Debounce function
    const debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    };

    // Address search function
    const searchAddresses = useCallback(
        debounce(async (value: string) => {
            if (!value || value.length < 3) {
                setAddressOptions([]);
                return;
            }

            setAddressLoading(true);
            setErrorMessage('');

            try {
                const response = await GeopifyService.searchAddresses(value);

                const formattedOptions = response.features.map((feature: GeopifyFeature, index: number) => {
                    const props = feature.properties;
                    const houseNumber = props.housenumber || props.house_number || '';
                    const building = props.name || props.building || '';

                    return {
                        key: index,
                        value: feature.properties.formatted || 'No formatted address',
                        label: (
                            <div style={{
                                padding: '8px 0',
                                borderBottom: index < response.features.length - 1 ? '1px solid #f0f0f0' : 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <MapPin size={16} style={{ color: '#1890ff', flexShrink: 0 }} />
                                    <Text strong style={{ fontSize: '14px' }}>{feature.properties.formatted}</Text>
                                </div>
                                {(houseNumber || building) && (
                                    <div style={{ padding: '24px', marginBottom: '2px' }}>
                                        <Text type="secondary" style={{ fontSize: '11px' }}>
                                            {houseNumber && `House: ${houseNumber}`}
                                            {houseNumber && building && ' • '}
                                            {building && `Building: ${building}`}
                                        </Text>
                                    </div>
                                )}
                            </div>
                        ),
                        feature
                    };
                });

                setAddressOptions(formattedOptions);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch addresses. Please try again.';
                setErrorMessage(errorMessage);
                setAddressOptions([]);
            } finally {
                setAddressLoading(false);
            }
        }, 300),
        []
    );

    // Handle address search
    const handleAddressSearch = (value: string) => {
        setAddressSearchValue(value);
        searchAddresses(value);
    };

    // Handle address selection
    const handleAddressSelect = (value: string, option: any) => {
        const feature: GeopifyFeature = option.feature;
        const props = feature.properties;

        const addressDetails: AddressDetails = {
            formatted: props.formatted || value,
            latitude: props.lat || feature.geometry.coordinates[1],
            longitude: props.lon || feature.geometry.coordinates[0]
        };

        setSelectedAddress(addressDetails);
        setAddressSearchValue(value);

        // Auto-fill form fields
        form.setFieldsValue({
            address: addressDetails.formatted
        });
    };

    // Handle edit button click
    const handleEdit = (property: PropertyData) => {
        setEditingPropertyId(property.id);
        setModalTitle('Edit Property');
        setIsModalVisible(true);
        setAddressSearchValue(property.address);

        // Populate form with existing property data
        form.setFieldsValue({
            address: property.address,
            purchaseDate: property.purchaseDate ? moment(property.purchaseDate) : null,
            purchasePrice: property.purchasePrice,
            squareFootage: property.squareFootage,
            lotSize: property.lotSize,
            propertyTaxId: property.propertyTaxId
        });

        setSelectedAddress({
            formatted: property.address,
            latitude: 0,
            longitude: 0
        });
    };

    // Handle carousel navigation
    const handlePrevious = () => {
        setCurrentPropertyIndex(prev => (prev === 0 ? properties.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentPropertyIndex(prev => (prev === properties.length - 1 ? 0 : prev + 1));
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        setErrorMessage('');
        try {
            const propertyData = {
                address: values.address,
                purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : '',
                purchasePrice: Number(values.purchasePrice),
                squareFootage: values.squareFootage,
                lotSize: values.lotSize,
                propertyTaxId: values.propertyTaxId
            };

            let response: { status: number; payload: { property: PropertyData; }; message: React.SetStateAction<string>; };
            if (editingPropertyId) {
                // Update existing property
                response = await updateProperty(editingPropertyId, propertyData);
                if (response.status === 1) {
                    setProperties(prev =>
                        prev.map(p => (p.id === editingPropertyId ? response.payload.property : p))
                    );
                }
            } else {
                // Add new property
                response = await addProperty(propertyData);
                if (response.status === 1) {
                    setProperties(prev => [...prev, response.payload.property]);
                    setCurrentPropertyIndex(properties.length); // Set to the newly added property
                }
            }

            if (response.status === 1) {
                setIsModalVisible(false);
                form.resetFields();
                setSelectedAddress(null);
                setAddressOptions([]);
                setAddressSearchValue('');
                setEditingPropertyId(null);
                setModalTitle('Add New Property');
            } else {
                setErrorMessage(response.message);
            }
        } catch (error) {
            console.error('Error saving property:', error);
            setErrorMessage('Error saving property information');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            padding: '24px 16px',
            minHeight: '450px',
            marginTop: '-26px',
            width: '100%',
            maxHeight: 'calc(100vh - 64px)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <div style={{ width: '100%', margin: '0 auto' }}>
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Home size={24} style={{ color: '#1890ff' }} />
                            <Title level={3} style={{ margin: 0, color: '#080c0fff' }}>
                                Property Information
                            </Title>
                        </div>
                    }
                    extra={
                        <Button
                            icon={<span style={{ fontSize: '26px', lineHeight: '20px', color: 'white' }}>+</span>}
                            onClick={() => {
                                setModalTitle('Add New Property');
                                setIsModalVisible(true);
                                setEditingPropertyId(null);
                                form.resetFields();
                                setSelectedAddress(null);
                                setAddressSearchValue('');
                            }}
                            style={{ border: '1px solid #1890ff', color: '#1890ff', backgroundColor: '#1890ff' }}
                        />
                    }
                    style={{
                        borderRadius: '8px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                        border: 'none',
                        background: '#ffffff',
                        minHeight: '450px',
                    }}
                >
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Spin size="large" />
                        </div>
                    )}
                    {!loading && properties.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                            <Home size={40} style={{ color: '#ccc', marginBottom: '16px' }} />
                            <p>No properties available. Click "Add" to create a new property.</p>
                        </div>
                    ) : (
                        <div style={{ padding: '16px 0' }}>
                            {properties.length > 0 && (
                                <Card
                                    key={properties[currentPropertyIndex].id}
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                                                <MapPin size={16} style={{ color: '#52c41a', flexShrink: 0 }} />
                                                <Text strong style={{ fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {properties[currentPropertyIndex].address}
                                                </Text>
                                            </div>
                                            <Button
                                                icon={<Edit size={16} />}
                                                onClick={() => handleEdit(properties[currentPropertyIndex])}
                                                style={{ border: 'none', marginLeft: '8px' }}
                                            >
                                                {/* Edit */}
                                            </Button>
                                        </div>
                                    }
                                    style={{ marginBottom: '16px', borderRadius: '8px', border: '1px solid #e8e8e8' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <Text type="secondary" style={{ color: 'black', fontSize: '16px' }}>Address:</Text>
                                            <Text style={{ display: 'block' }}>{properties[currentPropertyIndex].address}</Text>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                            <div>
                                                <Text type="secondary" style={{ color: 'black', fontSize: '16px' }}>Purchase Date-</Text>
                                                <Text>{properties[currentPropertyIndex].purchaseDate}</Text>
                                            </div>
                                            <div>
                                                <Text type="secondary" style={{ color: 'black', fontSize: '16px' }}>Purchase Price-</Text>
                                                <Text>${properties[currentPropertyIndex].purchasePrice}</Text>
                                            </div>
                                            <div>
                                                <Text type="secondary" style={{ color: 'black', fontSize: '16px' }}>Square Footage-</Text>
                                                <Text >{properties[currentPropertyIndex].squareFootage} sq-ft</Text>
                                            </div>
                                            <div>
                                                <Text type="secondary" style={{ color: 'black', fontSize: '16px' }}>Lot Size-</Text>
                                                <Text>{properties[currentPropertyIndex].lotSize} acres</Text>
                                            </div>
                                            <div>
                                                <Text type="secondary" style={{ color: 'black', fontSize: '16px' }}>Tax ID-</Text>
                                                <Text>{properties[currentPropertyIndex].propertyTaxId}</Text>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )}
                            {properties.length > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                                    <div style={{ textAlign: 'center', flex: 1 }}>
                                        <Text strong>{` ${currentPropertyIndex + 1} / ${properties.length}`}</Text>
                                    </div>
                                    <Space>
                                        <Button
                                            icon={<ChevronLeft size={16} />}
                                            onClick={handlePrevious}
                                            disabled={properties.length <= 1}
                                            style={{ borderRadius: '8px' }}
                                        >

                                        </Button>
                                        <Button
                                            icon={<ChevronRight size={16} />}
                                            onClick={handleNext}
                                            disabled={properties.length <= 1}
                                            style={{ borderRadius: '8px' }}
                                        >

                                        </Button>
                                    </Space>
                                </div>
                            )}
                        </div>
                    )}
                    {errorMessage && (
                        <Alert
                            message="Error"
                            description={errorMessage}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setErrorMessage('')}
                            style={{ marginTop: '16px' }}
                        />
                    )}
                </Card>

                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Home size={24} style={{ color: '#1890ff' }} />
                            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                                {modalTitle}
                            </Title>
                        </div>
                    }
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        form.resetFields();
                        setSelectedAddress(null);
                        setAddressOptions([]);
                        setAddressSearchValue('');
                        setEditingPropertyId(null);
                        setModalTitle('Add New Property');
                        setErrorMessage('');
                    }}
                    footer={null}
                    width={800}
                    style={{ top: 20 }}
                    bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        style={{ width: '100%' }}
                    >
                        {/* Address Autocomplete Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <Form.Item
                                label="Property Address"
                                name="address"
                                rules={[{ required: true, message: 'Please enter the property address' }]}
                            >
                                <AutoComplete
                                    style={{ width: '100%' }}
                                    options={addressOptions}
                                    onSearch={handleAddressSearch}
                                    onSelect={handleAddressSelect}
                                    value={addressSearchValue}
                                    placeholder=" (e.g., 123 Main Street, New York)"
                                    size="large"
                                    notFoundContent={
                                        addressLoading ? (
                                            <div style={{ textAlign: 'center', padding: '8px' }}>
                                                <Spin size="small" /> Searching worldwide...
                                            </div>
                                        ) : 'No addresses found'
                                    }
                                    dropdownStyle={{
                                        borderRadius: '8px',
                                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
                                        border: '1px solid #e8e8e8'
                                    }}
                                >
                                    <Input
                                        prefix={<Search size={16} style={{ color: '#bfbfbf' }} />}
                                        suffix={addressLoading ? <Spin size="small" /> : null}
                                        style={{ borderRadius: '8px', border: '2px solid #e8e8e8', transition: 'all 0.3s ease' }}
                                    />
                                </AutoComplete>
                            </Form.Item>

                            {errorMessage && (
                                <Alert
                                    message="Address Search Error"
                                    description={errorMessage}
                                    type="error"
                                    showIcon
                                    closable
                                    onClose={() => setErrorMessage('')}
                                    style={{ marginTop: '8px' }}
                                />
                            )}
                        </div>

                        {/* Property Details Form */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                            <Form.Item
                                label={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={16} style={{ color: '#1890ff' }} />
                                        <span>Purchase Date</span>
                                    </div>
                                }
                                name="purchaseDate"
                                rules={[{ required: true, message: 'Please select purchase date' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    size="large"
                                    placeholder="Select purchase date"
                                />
                            </Form.Item>

                            <Form.Item
                                label={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <DollarSign size={16} style={{ color: '#1890ff' }} />
                                        <span>Purchase Price</span>
                                    </div>
                                }
                                name="purchasePrice"
                                rules={[{ required: true, message: 'Please enter purchase price' }]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Enter purchase price"
                                    prefix="$"
                                    type="number"
                                />
                            </Form.Item>

                            <Form.Item
                                label={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Ruler size={16} style={{ color: '#1890ff' }} />
                                        <span>Square Footage</span>
                                    </div>
                                }
                                name="squareFootage"
                                rules={[{ required: true, message: 'Please enter square footage' }]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Enter square footage"
                                    suffix="sq ft"
                                    type="text"
                                />
                            </Form.Item>

                            <Form.Item
                                label={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Ruler size={16} style={{ color: '#1890ff' }} />
                                        <span>Lot Size</span>
                                    </div>
                                }
                                name="lotSize"
                                rules={[{ required: true, message: 'Please enter lot size' }]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Enter lot size"
                                    suffix="acres"
                                    type="text"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Property Tax ID"
                                name="propertyTaxId"
                                rules={[{ required: true, message: 'Please enter property tax ID' }]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Enter property tax ID"
                                />
                            </Form.Item>
                        </div>

                        {/* Submit Button */}
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                size="large"
                                style={{
                                    width: '100%',
                                    height: '50px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                                }}
                            >
                                {loading ? 'Saving Property...' : editingPropertyId ? 'Update Property' : 'Save Property Information'}
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default PropertyInformation;