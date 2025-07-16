'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Plus, Save, Code, FileText, Calendar, Tag, Globe, Lock } from 'lucide-react';

interface SolutionData {
  problemTitle: string;
  contest: string;
  difficulty: number | string;
  status: string;
  solvedDate: string;
  priority: string;
  isPublic: boolean;
  summary: string;
  approach: string;
  code: string;
  memo: string;
  algorithmTags: string[];
  contentTags: string[];
}

interface SolutionEditorProps {
  solution?: Partial<SolutionData> | null;
  onClose: () => void;
}

export default function SolutionEditor({ solution, onClose }: SolutionEditorProps) {
  const [formData, setFormData] = useState<SolutionData>({
    problemTitle: solution?.problemTitle || '',
    contest: solution?.contest || '',
    difficulty: solution?.difficulty || '',
    status: solution?.status || '自力AC',
    solvedDate: solution?.solvedDate || new Date().toISOString().split('T')[0],
    priority: solution?.priority || 'medium',
    isPublic: solution?.isPublic || false,
    summary: solution?.summary || '',
    approach: solution?.approach || '',
    code: solution?.code || '',
    memo: solution?.memo || '',
    algorithmTags: solution?.algorithmTags || [],
    contentTags: solution?.contentTags || [],
  });

  const [newAlgorithmTag, setNewAlgorithmTag] = useState('');
  const [newContentTag, setNewContentTag] = useState('');

  const algorithmTagSuggestions = [
    'DP', '全探索', '二分探索', 'グラフ', 'ビット演算', '数学', '文字列', 
    'データ構造', '貪欲法', '実装', 'Union-Find', 'セグメント木', 'BFS', 
    'DFS', '最短経路', '最大流', '組み合わせ', '確率', 'ゲーム理論', 
    '累積和', '座標圧縮', 'しゃくとり法'
  ];

  const contentTagSuggestions = [
    'グラフ', '数学', '文字列処理', 'ゲーム', 'シミュレーション', 
    '幾何', '構築', 'インタラクティブ', 'Ad-hoc'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAlgorithmTag = (tag: string) => {
    if (tag && !formData.algorithmTags.includes(tag)) {
      handleInputChange('algorithmTags', [...formData.algorithmTags, tag]);
      setNewAlgorithmTag('');
    }
  };

  const addContentTag = (tag: string) => {
    if (tag && !formData.contentTags.includes(tag)) {
      handleInputChange('contentTags', [...formData.contentTags, tag]);
      setNewContentTag('');
    }
  };

  const removeAlgorithmTag = (tag: string) => {
    handleInputChange('algorithmTags', formData.algorithmTags.filter(t => t !== tag));
  };

  const removeContentTag = (tag: string) => {
    handleInputChange('contentTags', formData.contentTags.filter(t => t !== tag));
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log('Saving solution:', formData);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{solution ? '解法を編集' : '新しい解法を記録'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="problemTitle">問題名</Label>
                  <Input
                    id="problemTitle"
                    value={formData.problemTitle}
                    onChange={(e) => handleInputChange('problemTitle', e.target.value)}
                    placeholder="ABC 301 D - Bitmask"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contest">コンテスト</Label>
                  <Input
                    id="contest"
                    value={formData.contest}
                    onChange={(e) => handleInputChange('contest', e.target.value)}
                    placeholder="AtCoder Beginner Contest 301"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">難易度</Label>
                  <Input
                    id="difficulty"
                    type="number"
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    placeholder="1200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">ステータス</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="自力AC">自力AC</SelectItem>
                      <SelectItem value="解説AC">解説AC</SelectItem>
                      <SelectItem value="挑戦中">挑戦中</SelectItem>
                      <SelectItem value="本番未AC">本番未AC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solvedDate">回答日</Label>
                  <Input
                    id="solvedDate"
                    type="date"
                    value={formData.solvedDate}
                    onChange={(e) => handleInputChange('solvedDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">振り返り優先度</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">高</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="low">低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isPublic">公開設定</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                    />
                    <div className="flex items-center space-x-1">
                      {formData.isPublic ? (
                        <>
                          <Globe className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm text-emerald-600">公開</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">非公開</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <span>タグ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Algorithm Tags */}
              <div className="space-y-3">
                <Label>アルゴリズムタグ</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.algorithmTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="default"
                      className="cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200"
                      onClick={() => removeAlgorithmTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newAlgorithmTag}
                    onChange={(e) => setNewAlgorithmTag(e.target.value)}
                    placeholder="新しいアルゴリズムタグ"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAlgorithmTag(newAlgorithmTag);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addAlgorithmTag(newAlgorithmTag)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {algorithmTagSuggestions
                    .filter(tag => !formData.algorithmTags.includes(tag))
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-slate-100"
                        onClick={() => addAlgorithmTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Content Tags */}
              <div className="space-y-3">
                <Label>問題内容タグ</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.contentTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="default"
                      className="cursor-pointer bg-purple-100 text-purple-700 hover:bg-purple-200"
                      onClick={() => removeContentTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newContentTag}
                    onChange={(e) => setNewContentTag(e.target.value)}
                    placeholder="新しい内容タグ"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addContentTag(newContentTag);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addContentTag(newContentTag)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {contentTagSuggestions
                    .filter(tag => !formData.contentTags.includes(tag))
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-slate-100"
                        onClick={() => addContentTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solution Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">解法内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="summary">解法要約</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="解法の要約を簡潔に記述..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="approach">アプローチ・考察</Label>
                <Textarea
                  id="approach"
                  value={formData.approach}
                  onChange={(e) => handleInputChange('approach', e.target.value)}
                  placeholder="問題へのアプローチや考察を詳しく記述..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo">振り返りメモ</Label>
                <Textarea
                  id="memo"
                  value={formData.memo}
                  onChange={(e) => handleInputChange('memo', e.target.value)}
                  placeholder="学んだこと、注意点、改善点など..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>コード</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="code">ソースコード</Label>
                <Textarea
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="ソースコードを貼り付け..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}