import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, TrendingUp, TrendingDown, Calendar, User, Edit, Trash2, Download, Filter, CreditCard, Banknote, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { apiService } from '../services/apiService';

interface Transaction {
  id: string;
  patientId: string;
  patientName: string;
  type: 'income' | 'expense';
  category: 'appointment' | 'consultation' | 'diet_plan' | 'exercise_program' | 'other';
  amount: number;
  description: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'other';
  status: 'paid' | 'pending' | 'overdue';
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface PatientBalance {
  patientId: string;
  patientName: string;
  totalPaid: number;
  totalOwed: number;
  balance: number;
  lastPayment?: string;
}

export const Accounting: React.FC = () => {
  const { patients } = useData();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [patientBalances, setPatientBalances] = useState<PatientBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    type: 'income' as Transaction['type'],
    category: 'appointment' as Transaction['category'],
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as Transaction['paymentMethod'],
    status: 'paid' as Transaction['status'],
    invoiceNumber: '',
    notes: ''
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    calculatePatientBalances();
  }, [transactions, patients]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTransactions();
      setTransactions(data || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePatientBalances = () => {
    const balances: Record<string, PatientBalance> = {};

    // Initialize balances for all patients
    patients.forEach(patient => {
      balances[patient.id] = {
        patientId: patient.id,
        patientName: `${patient.name} ${patient.surname}`,
        totalPaid: 0,
        totalOwed: 0,
        balance: 0
      };
    });

    // Calculate from transactions
    transactions.forEach(transaction => {
      if (!balances[transaction.patientId]) return;

      if (transaction.type === 'income') {
        if (transaction.status === 'paid') {
          balances[transaction.patientId].totalPaid += transaction.amount;
        } else {
          balances[transaction.patientId].totalOwed += transaction.amount;
        }
      }
    });

    // Calculate balance and find last payment
    Object.values(balances).forEach(balance => {
      balance.balance = balance.totalPaid - balance.totalOwed;
      
      const lastPayment = transactions
        .filter(t => t.patientId === balance.patientId && t.status === 'paid')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (lastPayment) {
        balance.lastPayment = lastPayment.date;
      }
    });

    setPatientBalances(Object.values(balances));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      if (!selectedPatient) {
        alert('Lütfen bir hasta seçiniz');
        return;
      }

      const transactionData = {
        patientId: formData.patientId,
        patientName: `${selectedPatient.name} ${selectedPatient.surname}`,
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        invoiceNumber: formData.invoiceNumber,
        notes: formData.notes
      };

      if (editingTransaction) {
        await apiService.updateTransaction(editingTransaction.id, transactionData);
      } else {
        await apiService.createTransaction(transactionData);
      }

      await loadTransactions();
      resetForm();
    } catch (error) {
      console.error('Failed to save transaction:', error);
      alert('İşlem kaydedilirken bir hata oluştu');
    }
  };

  const handleDelete = async (transactionId: string) => {
    if (confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deleteTransaction(transactionId);
        await loadTransactions();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        alert('İşlem silinirken bir hata oluştu');
      }
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      patientId: transaction.patientId,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: transaction.date,
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
      invoiceNumber: transaction.invoiceNumber || '',
      notes: transaction.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      type: 'income',
      category: 'appointment',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      status: 'paid',
      invoiceNumber: '',
      notes: ''
    });
    setEditingTransaction(null);
    setIsAddModalOpen(false);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.invoiceNumber && transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    
    const transactionDate = new Date(transaction.date);
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
    const matchesDate = transactionDate >= daysAgo;
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Calculate summary statistics
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = filteredTransactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const overdueAmount = filteredTransactions
    .filter(t => t.status === 'overdue')
    .reduce((sum, t) => sum + t.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Ödendi';
      case 'pending':
        return 'Bekliyor';
      case 'overdue':
        return 'Gecikmiş';
      default:
        return status;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'appointment':
        return 'Randevu';
      case 'consultation':
        return 'Danışmanlık';
      case 'diet_plan':
        return 'Diyet Planı';
      case 'exercise_program':
        return 'Spor Programı';
      default:
        return 'Diğer';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Nakit';
      case 'card':
        return 'Kart';
      case 'transfer':
        return 'Havale';
      default:
        return 'Diğer';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Muhasebe</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gelir, gider ve hasta ödemelerini yönetin ({transactions.length} işlem)
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni İşlem
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-emerald-100">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Toplam Gelir</dt>
                <dd className="text-2xl font-semibold text-gray-900">₺{totalIncome.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-red-100">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Toplam Gider</dt>
                <dd className="text-2xl font-semibold text-gray-900">₺{totalExpense.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-amber-100">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Bekleyen</dt>
                <dd className="text-2xl font-semibold text-gray-900">₺{pendingAmount.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Net Kar</dt>
                <dd className="text-2xl font-semibold text-gray-900">₺{(totalIncome - totalExpense).toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Balances */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Hasta Bakiyeleri</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hasta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Ödenen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borç</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bakiye</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Ödeme</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patientBalances
                .filter(balance => balance.totalPaid > 0 || balance.totalOwed > 0)
                .sort((a, b) => b.balance - a.balance)
                .slice(0, 10)
                .map((balance) => (
                <tr key={balance.patientId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{balance.patientName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{balance.totalPaid.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{balance.totalOwed.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      balance.balance >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      ₺{balance.balance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {balance.lastPayment ? new Date(balance.lastPayment).toLocaleDateString('tr-TR') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="İşlem ara (hasta, açıklama, fatura no)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 sm:flex-none border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Tüm Türler</option>
                <option value="income">Gelir</option>
                <option value="expense">Gider</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="paid">Ödendi</option>
                <option value="pending">Bekliyor</option>
                <option value="overdue">Gecikmiş</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="flex-1 sm:flex-none border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="7">Son 7 gün</option>
                <option value="30">Son 30 gün</option>
                <option value="90">Son 3 ay</option>
                <option value="365">Son 1 yıl</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">İşlemler yükleniyor...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all' ? 'İşlem bulunamadı' : 'Henüz işlem yok'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Arama kriterlerinize uygun işlem bulunmamaktadır.'
                  : 'İlk işleminizi oluşturmak için "Yeni İşlem" butonuna tıklayın.'
                }
              </p>
            </div>
          ) : (
            filteredTransactions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((transaction) => (
                <div key={transaction.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-6 w-6 text-emerald-600" />
                          ) : (
                            <TrendingDown className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                              {getStatusText(transaction.status)}
                            </span>
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {getCategoryText(transaction.category)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {transaction.patientName}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(transaction.date).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="flex items-center">
                            {transaction.paymentMethod === 'cash' ? (
                              <Banknote className="h-3 w-3 mr-1" />
                            ) : (
                              <CreditCard className="h-3 w-3 mr-1" />
                            )}
                            {getPaymentMethodText(transaction.paymentMethod)}
                          </div>
                          {transaction.invoiceNumber && (
                            <span>Fatura: {transaction.invoiceNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
                      <div className="text-center">
                        <p className={`text-lg font-bold ${
                          transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}₺{transaction.amount.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-center sm:justify-end gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Add/Edit Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={resetForm} />
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingTransaction ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}
                </h2>
                <button
                  onClick={resetForm}
                  className="rounded-md p-2 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hasta *
                    </label>
                    <select
                      required
                      value={formData.patientId}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Hasta seçiniz</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} {patient.surname}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İşlem Türü *
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="income"
                          checked={formData.type === 'income'}
                          onChange={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Gelir</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="expense"
                          checked={formData.type === 'expense'}
                          onChange={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Gider</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Transaction['category'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="appointment">Randevu</option>
                      <option value="consultation">Danışmanlık</option>
                      <option value="diet_plan">Diyet Planı</option>
                      <option value="exercise_program">Spor Programı</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tutar (₺) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tarih *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ödeme Yöntemi *
                    </label>
                    <select
                      required
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as Transaction['paymentMethod'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="cash">Nakit</option>
                      <option value="card">Kredi Kartı</option>
                      <option value="transfer">Havale/EFT</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durum *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Transaction['status'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="paid">Ödendi</option>
                      <option value="pending">Bekliyor</option>
                      <option value="overdue">Gecikmiş</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Açıklama *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="İşlem açıklaması"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fatura Numarası
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Varsa fatura numarası"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notlar
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ek notlar"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    {editingTransaction ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};