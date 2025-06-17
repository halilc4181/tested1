import React, { useState } from 'react';
import { Plus, Search, FileText, Download, Edit, Trash2, Eye, User, Calendar, Printer } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ContractModal } from '../components/Contracts/ContractModal';
import { ContractPreviewModal } from '../components/Contracts/ContractPreviewModal';

export interface Contract {
  id: string;
  patientId: string;
  patientName: string;
  type: 'service' | 'consent' | 'privacy' | 'payment' | 'custom';
  title: string;
  content: string;
  createdDate: string;
  signedDate?: string;
  status: 'draft' | 'sent' | 'signed' | 'expired';
  templateUsed?: string;
}

export const Contracts: React.FC = () => {
  const { patients } = useData();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || contract.type === filterType;
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const addContract = (contractData: Omit<Contract, 'id'>) => {
    const newContract: Contract = {
      ...contractData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setContracts(prev => [...prev, newContract]);
  };

  const updateContract = (id: string, contractData: Partial<Contract>) => {
    setContracts(prev => prev.map(contract => 
      contract.id === id ? { ...contract, ...contractData } : contract
    ));
  };

  const deleteContract = (id: string) => {
    if (confirm('Bu sözleşmeyi silmek istediğinizden emin misiniz?')) {
      setContracts(prev => prev.filter(contract => contract.id !== id));
    }
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handlePreview = (contract: Contract) => {
    setPreviewContract(contract);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
        return 'bg-emerald-100 text-emerald-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'signed':
        return 'İmzalandı';
      case 'sent':
        return 'Gönderildi';
      case 'expired':
        return 'Süresi Doldu';
      default:
        return 'Taslak';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'service':
        return 'Hizmet Sözleşmesi';
      case 'consent':
        return 'Onam Formu';
      case 'privacy':
        return 'Gizlilik Sözleşmesi';
      case 'payment':
        return 'Ödeme Sözleşmesi';
      default:
        return 'Özel Sözleşme';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sözleşmeler ve Belgeler</h1>
          <p className="mt-2 text-sm text-gray-600">
            Hasta sözleşmelerini ve belgelerini yönetin ({contracts.length} sözleşme)
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedContract(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Sözleşme
        </button>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sözleşme ara (başlık, hasta, içerik)..."
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
                <option value="service">Hizmet Sözleşmesi</option>
                <option value="consent">Onam Formu</option>
                <option value="privacy">Gizlilik Sözleşmesi</option>
                <option value="payment">Ödeme Sözleşmesi</option>
                <option value="custom">Özel Sözleşme</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="draft">Taslak</option>
                <option value="sent">Gönderildi</option>
                <option value="signed">İmzalandı</option>
                <option value="expired">Süresi Doldu</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredContracts.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all' ? 'Sözleşme bulunamadı' : 'Henüz sözleşme yok'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Arama kriterlerinize uygun sözleşme bulunmamaktadır.'
                  : 'İlk sözleşmenizi oluşturmak için "Yeni Sözleşme" butonuna tıklayın.'
                }
              </p>
              {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setSelectedContract(null);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Sözleşmeyi Oluştur
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredContracts.map((contract) => (
              <div key={contract.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {contract.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contract.status)}`}>
                            {getStatusText(contract.status)}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {getTypeText(contract.type)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {contract.patientName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Oluşturulma: {new Date(contract.createdDate).toLocaleDateString('tr-TR')}
                        </div>
                        {contract.signedDate && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            İmzalanma: {new Date(contract.signedDate).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center sm:justify-end gap-2">
                    <button
                      onClick={() => handlePreview(contract)}
                      className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                      title="Önizleme"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(contract)}
                      className="inline-flex items-center px-3 py-1 text-sm text-amber-600 hover:text-amber-700"
                      title="Düzenle"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteContract(contract.id)}
                      className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ContractModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedContract(null);
        }}
        onSave={selectedContract ? 
          (data) => updateContract(selectedContract.id, data) : 
          addContract
        }
        contract={selectedContract}
        patients={patients}
      />

      {previewContract && (
        <ContractPreviewModal
          contract={previewContract}
          onClose={() => setPreviewContract(null)}
        />
      )}
    </div>
  );
};