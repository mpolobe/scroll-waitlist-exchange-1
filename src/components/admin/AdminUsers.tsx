import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminUsersProps {
  onStatsUpdate: (count: number) => void;
}

export function AdminUsers({ onStatsUpdate }: AdminUsersProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const { user, adminRole } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const { data } = await supabase.functions.invoke('admin-get-users', {
        headers: { Authorization: `Bearer ${session.session?.access_token}` }
      });
      if (data?.success) {
        setUsers(data.users);
        onStatsUpdate(data.users.length);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (userToEdit: any) => {
    setSelectedUser(userToEdit);
    setSelectedRole(userToEdit.admin_role || '');
    setModalOpen(true);
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole || !user) return;

    setAssigning(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-assign-role', {
        body: {
          userId: selectedUser.id,
          role: selectedRole,
          requestingUserId: user.id
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: `Role assigned successfully to ${selectedUser.full_name || selectedUser.email}`
        });
        setModalOpen(false);
        loadUsers();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign role',
        variant: 'destructive'
      });
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <div className="p-4">Loading users...</div>;

  const isSuperAdmin = adminRole === 'super_admin';

  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((userItem) => (
            <TableRow key={userItem.id}>
              <TableCell>{userItem.full_name || 'N/A'}</TableCell>
              <TableCell>{userItem.email}</TableCell>
              <TableCell>{userItem.country || 'N/A'}</TableCell>
              <TableCell>
                {userItem.admin_role ? (
                  <Badge variant="default" className="capitalize">
                    {userItem.admin_role.replace('_', ' ')}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">User</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={userItem.email_verified ? 'default' : 'secondary'}>
                  {userItem.email_verified ? 'Verified' : 'Unverified'}
                </Badge>
              </TableCell>
              <TableCell>
                {isSuperAdmin && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openRoleModal(userItem)}
                  >
                    <UserCog className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Admin Role</DialogTitle>
            <DialogDescription>
              Assign an administrative role to {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Select Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            
            {selectedUser?.id === user?.id && selectedRole !== 'super_admin' && (
              <p className="text-sm text-destructive mt-2">
                Warning: You cannot remove your own super admin status
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignRole} 
              disabled={assigning || !selectedRole}
            >
              {assigning ? 'Assigning...' : 'Assign Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

