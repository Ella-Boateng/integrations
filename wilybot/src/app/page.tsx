"use client";
import Image from "next/image";
import React, {useState, useMemo, useEffect} from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Bug, GitBranch, TestTube, AlertTriangle, TrendingUp, Calendar, Filter, RefreshCw } from 'lucide-react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import moment from "moment";
import { PlaywrightResult } from "./api/result/route";



const detailedTestData = {
    passed: [
        { testId: 'TC_001', name: 'UserRegistration_ValidEmail', repository: 'auth-service', duration: 2.3, lastRun: '2 hours ago' },
        { testId: 'TC_045', name: 'PaymentProcess_ValidCard', repository: 'payment-gateway', duration: 1.8, lastRun: '1 hour ago' },
        { testId: 'TC_089', name: 'DataRetrieval_StandardQuery', repository: 'backend-api', duration: 0.9, lastRun: '30 min ago' },
        { testId: 'TC_134', name: 'UINavigation_MainMenu', repository: 'frontend-app', duration: 3.2, lastRun: '45 min ago' },
        { testId: 'TC_201', name: 'FileUpload_SmallFile', repository: 'mobile-app', duration: 1.5, lastRun: '1.5 hours ago' }
    ],
    failed: [
        { testId: 'TC_023', name: 'LoginAttempt_InvalidPassword', repository: 'auth-service', duration: 0.5, lastRun: '15 min ago', failReason: 'Assertion failed: Expected status 401, got 500' },
        { testId: 'TC_156', name: 'PaymentProcess_ExpiredCard', repository: 'payment-gateway', duration: 2.1, lastRun: '20 min ago', failReason: 'Connection timeout to payment gateway' },
        { testId: 'TC_298', name: 'DatabaseQuery_LargeDataset', repository: 'backend-api', duration: 15.7, lastRun: '10 min ago', failReason: 'Query execution timeout after 15 seconds' },
        { testId: 'TC_445', name: 'FormValidation_EmptyFields', repository: 'frontend-app', duration: 1.2, lastRun: '5 min ago', failReason: 'Element not found: #submit-button' }
    ],
    flaky: [
        { testId: 'TC_067', name: 'NetworkRequest_SlowConnection', repository: 'mobile-app', duration: 8.3, lastRun: '1 hour ago', flakyPattern: 'Passes 60% of time, fails on timeout', successRate: 0.6 },
        { testId: 'TC_189', name: 'LoadBalancer_MultipleRequests', repository: 'backend-api', duration: 4.7, lastRun: '2 hours ago', flakyPattern: 'Race condition in concurrent requests', successRate: 0.75 },
        { testId: 'TC_234', name: 'CacheInvalidation_UserData', repository: 'auth-service', duration: 2.9, lastRun: '30 min ago', flakyPattern: 'Inconsistent cache clearing', successRate: 0.8 },
        { testId: 'TC_356', name: 'AnimationTiming_ButtonClick', repository: 'frontend-app', duration: 1.8, lastRun: '45 min ago', flakyPattern: 'Timing-dependent UI interactions', successRate: 0.7 }
    ]
};

const bugResolutionData = [
    { month: 'Jan', resolved: 85, total: 100, rate: 85 },
    { month: 'Feb', resolved: 92, total: 105, rate: 87.6 },
    { month: 'Mar', resolved: 78, total: 95, rate: 82.1 },
    { month: 'Apr', resolved: 88, total: 98, rate: 89.8 },
    { month: 'May', resolved: 94, total: 110, rate: 85.5 },
    { month: 'Jun', resolved: 96, total: 108, rate: 88.9 }
];

const bugDensityData = [
    { repo: 'frontend-app', bugs: 23, testsRun: 1250, density: 0.0184 },
    { repo: 'backend-api', bugs: 15, testsRun: 890, density: 0.0169 },
    { repo: 'mobile-app', bugs: 31, testsRun: 456, density: 0.0680 },
    { repo: 'auth-service', bugs: 8, testsRun: 1120, density: 0.0071 },
    { repo: 'payment-gateway', bugs: 12, testsRun: 340, density: 0.0353 },
    { repo: 'notification-service', bugs: 6, testsRun: 780, density: 0.0077 }
];

const reopenRateData = [
    { category: 'UI Bugs', reopened: 12, total: 45, rate: 26.7 },
    { category: 'API Issues', reopened: 8, total: 52, rate: 15.4 },
    { category: 'Performance', reopened: 15, total: 38, rate: 39.5 },
    { category: 'Security', reopened: 3, total: 28, rate: 10.7 },
    { category: 'Integration', reopened: 9, total: 35, rate: 25.7 }
];

const hotspotData = [
    {
        repository: 'frontend-app',
        testCase: 'UserLogin_ValidCredentials',
        testId: 'TC_001',
        reopenCount: 7,
        executions: 245,
        reopenRate: 2.86,
        severity: 'Critical',
        lastReopen: '1 day ago',
        uniqueBugs: 4,
        hotspotScore: 85.2
    },
    {
        repository: 'payment-gateway',
        testCase: 'ProcessPayment_CreditCard',
        testId: 'TC_043',
        reopenCount: 5,
        executions: 156,
        reopenRate: 3.21,
        severity: 'Critical',
        lastReopen: '2 days ago',
        uniqueBugs: 3,
        hotspotScore: 72.8
    },
    {
        repository: 'mobile-app',
        testCase: 'ProfileUpdate_ImageUpload',
        testId: 'TC_087',
        reopenCount: 4,
        executions: 189,
        reopenRate: 2.12,
        severity: 'High',
        lastReopen: '3 days ago',
        uniqueBugs: 2,
        hotspotScore: 58.4
    },
    {
        repository: 'backend-api',
        testCase: 'DataSync_LargePayload',
        testId: 'TC_156',
        reopenCount: 3,
        executions: 98,
        reopenRate: 3.06,
        severity: 'High',
        lastReopen: '5 days ago',
        uniqueBugs: 2,
        hotspotScore: 45.7
    },
    {
        repository: 'auth-service',
        testCase: 'TokenRefresh_ExpiredSession',
        testId: 'TC_023',
        reopenCount: 2,
        executions: 142,
        reopenRate: 1.41,
        severity: 'Medium',
        lastReopen: '1 week ago',
        uniqueBugs: 1,
        hotspotScore: 28.3
    }
];

const testCoverageData = [
    { module: 'Authentication', coverage: 95, bugs: 3, quality: 'Excellent' },
    { module: 'Payment Processing', coverage: 78, bugs: 12, quality: 'Good' },
    { module: 'User Management', coverage: 65, bugs: 18, quality: 'Fair' },
    { module: 'Notifications', coverage: 42, bugs: 25, quality: 'Poor' },
    { module: 'Reporting', coverage: 88, bugs: 6, quality: 'Good' },
    { module: 'File Upload', coverage: 35, bugs: 31, quality: 'Critical' }
];

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316'];
const SEVERITY_COLORS = {
    'Critical': '#dc2626',
    'High': '#ea580c',
    'Medium': '#d97706',
    'Low': '#65a30d'
};

interface Batch {
    id: string;
    created_at: string;
    hash: string
}

export interface Result {
    stats?: {
        duration: number,
        expected: number
        flaky: number
        skipped: number
        unexpected: number
        startTime: string
        average_resolution: number,
        reopened_count: number
    },
    hotspots: PlaywrightResult[]
    created_at: string;
}

export default function Home() {

    const [selectedTimeframe, setSelectedTimeframe] = useState('6m');
    const [selectedMetric, setSelectedMetric] = useState('all');
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedTestDetail, setSelectedTestDetail] = useState(null);
    const [showTestModal, setShowTestModal] = useState(false);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [result, setResult] = useState<Result | null>(null);

    const overallQualityScore = useMemo(() => {
        const avgResolutionRate = bugResolutionData.reduce((acc, item) => acc + item.rate, 0) / bugResolutionData.length;
        const avgReopenRate = reopenRateData.reduce((acc, item) => acc + item.rate, 0) / reopenRateData.length;
        const avgCoverage = testCoverageData.reduce((acc, item) => acc + item.coverage, 0) / testCoverageData.length;

        return Math.round((avgResolutionRate * 0.4 + (100 - avgReopenRate) * 0.3 + avgCoverage * 0.3));
    }, []);


    useEffect(() => {
        (async () => {
            let response = await loadBatches();
            let data = response as Batch[]
            setBatches([...data]);
            console.log('Fetching batches...',response);
        })()
    },[])


    const testSummaryData = useMemo(() => {
        let totalTest = (result?.stats?.expected ?? 0) + (result?.stats?.unexpected ?? 0);
        let passed = (result?.stats?.expected ?? 0);
        let failed = (result?.stats?.unexpected ?? 0);
        let flaky = (result?.stats?.flaky ?? 0);
        return {
            totalTests: totalTest,
            passed: passed,
            failed: failed,
            flaky: flaky,
            passRate: (passed / totalTest) * 100,
            failRate: (failed / totalTest) * 100 ,
            flakyRate: (flaky / totalTest) * 100,
            average_reopened_rate: passed > 0 ? (result?.stats?.reopened_count ?? 0 / passed) * 100 : 0
        }
    },[result])



    useEffect(() => {
        console.log('batches.',batches);
    },[batches])

    const loadBatches = async () => {
        let response = await fetch("/api/dashboard");
        return response.json();
    }

    const loadResults = async (batchId: string) => {
        let response = await fetch(`/api/result?batchId=${batchId}`);
        return response.json();
    }

    const TestSummaryCard = ({ title, value, percentage, color, testType, onClick }) => (
        <div
            className="bg-white p-6 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onClick(testType)}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value?.toLocaleString()}</p>
                    <p className={`text-sm ${color} flex items-center`}>
                        {percentage.toFixed(1)}% of total tests
                    </p>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    testType === 'passed' ? 'bg-green-100' :
                        testType === 'failed' ? 'bg-red-100' :
                            'bg-yellow-100'
                }`}>
          <span className={`text-2xl font-bold ${color}`}>
            {testType === 'passed' ? '✓' :
                testType === 'failed' ? '✗' :
                    '⚠'}
          </span>
                </div>
            </div>
        </div>
    );

    const TestDetailModal = ({ testType, tests, onClose }) => {
        if (!testType) return null;

        const getStatusColor = (type) => {
            switch(type) {
                case 'passed': return 'text-green-600 bg-green-50';
                case 'failed': return 'text-red-600 bg-red-50';
                case 'flaky': return 'text-yellow-600 bg-yellow-50';
                default: return 'text-gray-600 bg-gray-50';
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-bold capitalize">{testType} Tests ({tests.length})</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    <div className="overflow-y-auto max-h-[60vh] p-6">
                        <div className="space-y-4">
                            {tests.map((test, index) => (
                                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{test.name}</h3>
                                            <p className="text-sm text-gray-600">{test.testId} • {test.repository}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(testType)}`}>
                      {testType.charAt(0).toUpperCase() + testType.slice(1)}
                    </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Duration: </span>
                                            <span className="font-medium">{test.duration}s</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Last Run: </span>
                                            <span className="font-medium">{test.lastRun}</span>
                                        </div>
                                        {test.failReason && (
                                            <div className="md:col-span-1">
                                                <span className="text-gray-500">Reason: </span>
                                                <span className="font-medium text-red-600">{test.failReason}</span>
                                            </div>
                                        )}
                                        {test.flakyPattern && (
                                            <div className="md:col-span-2">
                                                <span className="text-gray-500">Pattern: </span>
                                                <span className="font-medium text-yellow-600">{test.flakyPattern}</span>
                                            </div>
                                        )}
                                        {test.successRate && (
                                            <div>
                                                <span className="text-gray-500">Success Rate: </span>
                                                <span className="font-medium">{(test.successRate * 100).toFixed(1)}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleTestSummaryClick = (testType) => {
        setSelectedTestDetail({
            type: testType,
            tests: detailedTestData[testType] || []
        });
        setShowTestModal(true);
    };

    const MetricCard = ({ title, value, change, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {change && (
                        <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {change > 0 ? '+' : ''}{change}%
                        </p>
                    )}
                </div>
                <Icon className={`w-8 h-8 ${color}`} />
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quality Index System</h1>
                    <p className="text-gray-600">Monitor and analyze software quality metrics across your development
                        lifecycle</p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500"/>
                        <Select onValueChange={(field) => {
                            loadResults(field).then(results => {
                                setResult(results as Result);
                                console.log("results", results);
                            });
                        }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Batch" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    batches.map(item => {
                                        return (
                                            <SelectItem key={item.id} value={item.id} >{item.hash} - {moment(item.created_at).fromNow()}</SelectItem>
                                        )
                                    })
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                        <RefreshCw className="w-4 h-4"/>
                        Refresh Data
                    </button>
                </div>

                {/* Quality Score */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-2">Overall Quality Score</h2>
                            <p className="text-blue-100">Composite metric based on resolution rate, reopen rate, and
                                test coverage</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold">{overallQualityScore}%</div>
                            <div className="text-sm text-blue-100">
                                {overallQualityScore >= 90 ? 'Excellent' :
                                    overallQualityScore >= 80 ? 'Good' :
                                        overallQualityScore >= 70 ? 'Fair' : 'Needs Improvement'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                {id: 'overview', label: 'Overview'},
                                {id: 'resolution', label: 'Bug Resolution'},
                                {id: 'density', label: 'Bug Density'},
                                {id: 'hotspots', label: 'Hotspots'},
                                {id: 'coverage', label: 'Test Coverage'}
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Test Summary Section */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Execution Summary</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <div className="bg-white p-6 rounded-lg border shadow-sm">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-600">Total Tests</p>
                                        <p className="text-4xl font-bold text-gray-900">{(result?.stats?.expected ?? 0) + (result?.stats?.unexpected ?? 0)}</p>
                                        <p className="text-sm text-gray-500">{moment(result?.created_at).fromNow()}</p>
                                    </div>
                                </div>

                                <TestSummaryCard
                                    title="Tests Passed"
                                    value={result?.stats?.expected}
                                    percentage={testSummaryData.passRate}
                                    color="text-green-600"
                                    testType="passed"
                                    onClick={handleTestSummaryClick}
                                />

                                <TestSummaryCard
                                    title="Tests Failed"
                                    value={result?.stats?.unexpected}
                                    percentage={testSummaryData.failRate}
                                    color="text-red-600"
                                    testType="failed"
                                    onClick={handleTestSummaryClick}
                                />

                                <TestSummaryCard
                                    title="Flaky Tests"
                                    value={result?.stats?.flaky}
                                    percentage={testSummaryData.flakyRate}
                                    color="text-yellow-600"
                                    testType="flaky"
                                    onClick={handleTestSummaryClick}
                                />
                            </div>

                            {/* Test Distribution Chart */}
                            <div className="bg-white p-6 rounded-lg border mb-6">
                                <h3 className="text-lg font-semibold mb-4">Test Status Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                {name: 'Passed', value: result?.stats?.expected, color: '#10b981'},
                                                {name: 'Failed', value: result?.stats?.unexpected, color: '#ef4444'},
                                                {name: 'Flaky', value: result?.stats?.flaky, color: '#f59e0b'}
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            dataKey="value"
                                            label={({
                                                        name,
                                                        value,
                                                        percent
                                                    }) => `${name}: ${value} (${(Number(percent ?? 0) * 100).toFixed(1)}%)`}
                                        >
                                            {[
                                                {name: 'Passed', value: result?.stats?.expected, color: '#10b981'},
                                                {name: 'Failed', value: result?.stats?.unexpected, color: '#ef4444'},
                                                {name: 'Flaky', value: result?.stats?.flaky, color: '#f59e0b'}
                                            ].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color}/>
                                            ))}
                                        </Pie>
                                        <Tooltip/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quality Metrics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <MetricCard
                                    title="Avg Resolution Rate"
                                   value={`${(result?.stats?.average_resolution ?? 0).toFixed(2)}%`}
                                    change={2.3}
                                    icon={Bug}
                                    color="text-blue-600"
                                />
                                <MetricCard
                                    title="Reopen Count"
                                    value={result?.stats?.reopened_count}
                                    change={-1.8}
                                    icon={RefreshCw}
                                    color="text-red-600"
                                />
                                <MetricCard
                                    title="Critical Hotspots"
                                    value={result?.hotspots.length}
                                    change={-1}
                                    icon={AlertTriangle}
                                    color="text-orange-600"
                                />
                                <MetricCard
                                    title="Avg Test Coverage"
                                    value="67.2%"
                                    change={4.1}
                                    icon={TestTube}
                                    color="text-green-600"
                                />
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-4">Bug Resolution Trend</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={bugResolutionData}>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="month"/>
                                        <YAxis/>
                                        <Tooltip/>
                                        <Area type="monotone" dataKey="rate" stroke="#3b82f6" fill="#3b82f6"
                                              fillOpacity={0.1}/>
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white p-6 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-4">Reopen Rate by Category</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={reopenRateData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="reopened"
                                            label={({category, rate}) => `${category}: ${rate}%`}
                                        >
                                            {reopenRateData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                            ))}
                                        </Pie>
                                        <Tooltip/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Test Detail Modal */}
                {showTestModal && selectedTestDetail && (
                    <TestDetailModal
                        testType={selectedTestDetail.type}
                        tests={selectedTestDetail.tests}
                        onClose={() => {
                            setShowTestModal(false);
                            setSelectedTestDetail(null);
                        }}
                    />
                )}

                {/* Bug Resolution Tab */}
                {activeTab === 'resolution' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-4">Bug Resolution Rate Over Time</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={bugResolutionData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="month"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Bar dataKey="resolved" fill="#10b981" name="Resolved"/>
                                    <Bar dataKey="total" fill="#ef4444" name="Total"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-6 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-4">Resolution Rate Details</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total
                                            Bugs
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution
                                            Rate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {bugResolutionData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.month}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.resolved}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.rate.toFixed(1)}%</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.rate >= 90 ? 'bg-green-100 text-green-800' :
                                  item.rate >= 80 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                          }`}>
                            {item.rate >= 90 ? 'Excellent' : item.rate >= 80 ? 'Good' : 'Needs Improvement'}
                          </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bug Density Tab */}
                {activeTab === 'density' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-4">Bug Density by Repository (Bugs per Test
                                Run)</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={bugDensityData} layout="horizontal">
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis type="number" tickFormatter={(value) => (value * 1000).toFixed(1)}/>
                                    <YAxis dataKey="repo" type="category" width={120}/>
                                    <Tooltip
                                        formatter={(value) => [`${(value * 1000).toFixed(2)} per 1k tests`, 'Bug Density']}/>
                                    <Bar dataKey="density" fill="#8b5cf6"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-4">Total Bugs by Repository</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={bugDensityData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="bugs"
                                            label={({repo, bugs}) => `${repo}: ${bugs}`}
                                        >
                                            {bugDensityData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                            ))}
                                        </Pie>
                                        <Tooltip/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white p-6 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-4">Repository Test Metrics</h3>
                                <div className="space-y-4">
                                    {bugDensityData.map((repo, index) => (
                                        <div key={index}
                                             className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{repo.repo}</p>
                                                <p className="text-sm text-gray-600">{repo.testsRun.toLocaleString()} tests
                                                    run</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-lg">{repo.bugs}</p>
                                                <p className="text-sm text-gray-600">{(repo.density * 1000).toFixed(1)} bugs/1k
                                                    tests</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hotspots Tab */}
                {activeTab === 'hotspots' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-4">Test Hotspots - Frequent Bug Reopening</h3>
                            <div className="space-y-4">
                                {hotspotData.map((hotspot, index) => (
                                    <div key={index}
                                         className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div className="flex items-center space-x-4">
                                            <AlertTriangle className={`w-5 h-5 ${
                                                hotspot.severity === 'Critical' ? 'text-red-600' :
                                                    hotspot.severity === 'High' ? 'text-orange-600' :
                                                        hotspot.severity === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                                            }`}/>
                                            <div>
                                                <p className="font-medium text-gray-900">{hotspot.testCase}</p>
                                                <p className="text-sm text-gray-600">{hotspot.repository} • {hotspot.testId}</p>
                                                <p className="text-xs text-gray-500">Last
                                                    reopen: {hotspot.lastReopen}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-6">
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">Reopen Count</p>
                                                <p className="font-bold text-lg text-red-600">{hotspot.reopenCount}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">Reopen Rate</p>
                                                <p className="font-bold text-sm">{hotspot.reopenRate.toFixed(2)}%</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">Executions</p>
                                                <p className="font-bold text-sm">{hotspot.executions}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">Hotspot Score</p>
                                                <p className="font-bold text-lg">{hotspot.hotspotScore}</p>
                                            </div>
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    hotspot.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                                                        hotspot.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                                                            hotspot.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                }`}>
                        {hotspot.severity}
                      </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-4">Repository Hotspot Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={[
                                        {
                                            repository: 'frontend-app',
                                            hotspots: hotspotData.filter(h => h.repository === 'frontend-app').length,
                                            avgScore: 85.2
                                        },
                                        {
                                            repository: 'payment-gateway',
                                            hotspots: hotspotData.filter(h => h.repository === 'payment-gateway').length,
                                            avgScore: 72.8
                                        },
                                        {
                                            repository: 'mobile-app',
                                            hotspots: hotspotData.filter(h => h.repository === 'mobile-app').length,
                                            avgScore: 58.4
                                        },
                                        {
                                            repository: 'backend-api',
                                            hotspots: hotspotData.filter(h => h.repository === 'backend-api').length,
                                            avgScore: 45.7
                                        },
                                        {
                                            repository: 'auth-service',
                                            hotspots: hotspotData.filter(h => h.repository === 'auth-service').length,
                                            avgScore: 28.3
                                        }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="repository"/>
                                        <YAxis/>
                                        <Tooltip/>
                                        <Bar dataKey="avgScore" fill="#ef4444" name="Avg Hotspot Score"/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white p-6 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-4">Test Management Insights</h3>
                                <div className="space-y-4">
                                    <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                                        <p className="font-semibold text-red-800">Critical Action Required</p>
                                        <p className="text-sm text-red-700">2 tests with reopens in last 3 days</p>
                                    </div>
                                    <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                                        <p className="font-semibold text-orange-800">High Priority</p>
                                        <p className="text-sm text-orange-700">frontend-app has highest reopen rate</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                        <p className="font-semibold text-blue-800">Pattern Detected</p>
                                        <p className="text-sm text-blue-700">Login & Payment tests need attention</p>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="font-medium text-gray-900 mb-2">Recommended Actions:</h4>
                                        <ul className="text-sm text-gray-700 space-y-1">
                                            <li>• Review UserLogin test implementation</li>
                                            <li>• Stabilize payment gateway test data</li>
                                            <li>• Increase test environment monitoring</li>
                                            <li>• Schedule test maintenance sprint</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Test Coverage Tab */}
                {activeTab === 'coverage' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-4">Test Coverage vs Bug Density</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={testCoverageData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="module"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Bar dataKey="coverage" fill="#10b981" name="Coverage %"/>
                                    <Bar dataKey="bugs" fill="#ef4444" name="Bug Count"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-4">Coverage Quality Matrix</h3>
                                <div className="space-y-3">
                                    {testCoverageData.map((module, index) => (
                                        <div key={index}
                                             className="flex items-center justify-between p-3 rounded-lg border">
                                            <div>
                                                <p className="font-medium text-gray-900">{module.module}</p>
                                                <p className="text-sm text-gray-600">{module.bugs} bugs</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center space-x-2">
                                                    <div className="text-lg font-bold">{module.coverage}%</div>
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            module.quality === 'Excellent' ? 'bg-green-100 text-green-800' :
                                                                module.quality === 'Good' ? 'bg-blue-100 text-blue-800' :
                                                                    module.quality === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                                                        module.quality === 'Poor' ? 'bg-orange-100 text-orange-800' :
                                                                            'bg-red-100 text-red-800'
                                                        }`}>
                            {module.quality}
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-4">Quality Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                {
                                                    quality: 'Excellent',
                                                    count: testCoverageData.filter(m => m.quality === 'Excellent').length
                                                },
                                                {
                                                    quality: 'Good',
                                                    count: testCoverageData.filter(m => m.quality === 'Good').length
                                                },
                                                {
                                                    quality: 'Fair',
                                                    count: testCoverageData.filter(m => m.quality === 'Fair').length
                                                },
                                                {
                                                    quality: 'Poor',
                                                    count: testCoverageData.filter(m => m.quality === 'Poor').length
                                                },
                                                {
                                                    quality: 'Critical',
                                                    count: testCoverageData.filter(m => m.quality === 'Critical').length
                                                }
                                            ].filter(item => item.count > 0)}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="count"
                                            label={({quality, count}) => `${quality}: ${count}`}
                                        >
                                            {COLORS.map((color, index) => (
                                                <Cell key={`cell-${index}`} fill={color}/>
                                            ))}
                                        </Pie>
                                        <Tooltip/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
