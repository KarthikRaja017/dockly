
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Tag, message } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { showNotification } from '../../utils/notification';
import { addSmartNotes, fetchNoteSuggestions } from '../../services/planner';
import DocklyLoader from '../../utils/docklyLoader';

const familyMembers = ['john', 'emma', 'sarah', 'alex', 'mike'];

interface SmartInputBoxProps {
    allowMentions?: boolean;
    source?: string;
}

const SmartInputBox: React.FC<SmartInputBoxProps> = ({ allowMentions = false, source = 'planner' }) => {
    const [newEventText, setNewEventText] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [frequentNotes, setFrequentNotes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<any>(null);

    useEffect(() => {
        const uid = localStorage.getItem('userId') || '';
        if (!uid) return;

        const fetchSuggestions = async () => {
            try {
                const suggestions = await fetchNoteSuggestions(uid, source);
                setFrequentNotes(suggestions);
            } catch (err) {
                console.error('Failed to load frequent notes', err);
            }
        };

        fetchSuggestions();
    }, [source]);

    const handleInputChange = (e: any) => {
        const value = e.target.value;
        const cursor = e.target.selectionStart;

        setNewEventText(value);
        setCursorPosition(cursor);

        const triggerIndex = value.lastIndexOf('@', cursor - 1);
        const justTypedAt = triggerIndex !== -1 && cursor === triggerIndex + 1;

        if (justTypedAt && !allowMentions) {
            showNotification(
                'Mentions not supported here',
                'To mention family members, please use the Family Hub page.',
                'warning'
            );
        }

        if (
            allowMentions &&
            (justTypedAt || (triggerIndex !== -1 && /\s/.test(value[triggerIndex + 1])))
        ) {
            setShowMentions(true);
        } else {
            setShowMentions(false);
        }
    };

    const handleSelectMention = (mention: string) => {
        const before = newEventText.substring(0, cursorPosition);
        const after = newEventText.substring(cursorPosition);
        const updatedText = before + mention + ' ' + after;

        setNewEventText(updatedText);
        setShowMentions(false);

        setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 0);
    };

    const handleAddEvent = async () => {
        if (!newEventText.trim()) return;
        setLoading(true);

        const uid = localStorage.getItem('userId') || '';
        const memberMatch = newEventText.match(/@(\w+)/);
        const memberName = memberMatch ? memberMatch[1] : '';

        try {
            await addSmartNotes({
                note: newEventText,
                members: memberName,
                userId: uid,
                source: source,
            });

            message.success('Event saved successfully!');
            setNewEventText('');
        } catch (error) {
            console.error(error);
            message.error('Failed to save event');
        }
        setLoading(false);
    };

    if (loading) {
        return <DocklyLoader />;
    }

    return (
        <div style={{ marginBottom: '16px' }}>
            <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Input
                    ref={inputRef}
                    value={newEventText}
                    onChange={handleInputChange}
                    onPressEnter={handleAddEvent}
                    placeholder="Try: 'Soccer practice for Emma next Monday at 4pm' or 'Family dinner tomorrow @6pm'"
                    style={{
                        borderRadius: 10,
                        padding: '14px 16px',
                        fontSize: 14,
                        flex: 1,
                        backgroundColor: '#fff',
                        border: '1px solid #d1d5db',
                    }}
                />
                <Button
                    type="primary"
                    shape="circle"
                    icon={<ArrowRightOutlined />}
                    onClick={handleAddEvent}
                    style={{
                        height: 44,
                        width: 44,
                        fontSize: 16,
                        backgroundColor: '#3b82f6',
                        borderColor: '#3b82f6',
                    }}
                />

                {allowMentions && showMentions && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 50,
                            left: 10,
                            background: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: 6,
                            padding: '4px 8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            zIndex: 10,
                        }}
                    >
                        {familyMembers.map((member) => (
                            <div
                                key={member}
                                onClick={() => handleSelectMention(`@${member}`)}
                                style={{
                                    padding: '6px 8px',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    color: '#333',
                                }}
                            >
                                @{member}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: 11, color: '#6b7280', marginTop: 8 }}>
                <span style={{ fontWeight: 600 }}>Try:</span>
                {frequentNotes.map((example, index) => (
                    <Tag
                        key={index}
                        onClick={() => setNewEventText(example)}
                        style={{
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #e5e7eb',
                            cursor: 'pointer',
                            fontSize: 10,
                        }}
                    >
                        "{example}"
                    </Tag>
                ))}
            </div>
        </div>
    );
};

export default SmartInputBox;


