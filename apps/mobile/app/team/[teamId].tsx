import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../src/components/AppButton";
import { AvatarWithFallback } from "../../src/components/AvatarWithFallback";
import { useAcceptApplication, useAddRole, useApplyToRole, useRejectApplication, useTeamDetail } from "../../src/lib/apiHooks";
import { api } from "../../src/lib/axios";
import { useAuthStore } from "../../src/store/useAuthStore";

const stageColors: Record<string, string> = {
  FORMING: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-600",
};

const categoryLabels: Record<string, string> = {
  SCHOOL_STARTUP: "Startup",
  COMPETITION: "Competition",
  BUSINESS_FAIR: "Biz Fair",
  PERSONAL_PROJECT: "Personal",
};

export default function TeamDetailScreen() {
  const router = useRouter();
  const { teamId, tab: initialTab } = useLocalSearchParams<{ teamId: string; tab?: string }>();
  const myId = useAuthStore((s) => s.user?.id);
  const { data: team, isLoading } = useTeamDetail(teamId);
  const applyMutation = useApplyToRole();
  const addRoleMutation = useAddRole();

  const [applyRoleId, setApplyRoleId] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [roleTitle, setRoleTitle] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [roleSkills, setRoleSkills] = useState("");
  const [detailTab, setDetailTab] = useState<"roles" | "members" | "applications">(
    initialTab === "apps" ? "applications" : "roles"
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#5B4DFF" size="large" />
      </SafeAreaView>
    );
  }

  if (!team) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <Text className="text-muted">Team not found</Text>
      </SafeAreaView>
    );
  }

  const isOwner = team.ownerId === myId;
  const isMember = team.members?.some((m: any) => m.userId === myId);

  const handleApply = async () => {
    if (!applyRoleId) return;
    try {
      await applyMutation.mutateAsync({ roleId: applyRoleId, message: applyMessage });
      Alert.alert("Applied!", "Your application has been submitted.");
      setApplyRoleId(null);
      setApplyMessage("");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e.message || "Something went wrong");
    }
  };

  const handleAddRole = async () => {
    if (!roleTitle.trim()) { Alert.alert("Error", "Role title is required"); return; }
    try {
      await addRoleMutation.mutateAsync({
        teamId: teamId!,
        title: roleTitle.trim(),
        description: roleDesc.trim() || undefined,
        skillsNeeded: roleSkills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      Alert.alert("Done", "Role added");
      setAddRoleOpen(false);
      setRoleTitle("");
      setRoleDesc("");
      setRoleSkills("");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-8">
        <TouchableOpacity onPress={() => router.back()} className="mt-3 h-12 w-12 items-center justify-center rounded-2xl bg-white">
          <Ionicons name="arrow-back" size={21} color="#101828" />
        </TouchableOpacity>

        <View className="mt-6 rounded-[30px] bg-ink p-7">
          <Text className="text-xs font-semibold uppercase tracking-widest text-indigo-200">Team</Text>
          <Text className="mt-4 text-3xl font-bold text-white">{team.name}</Text>
          <View className="mt-4 flex-row">
            <View className="rounded-full bg-indigo-900/50 px-3 py-1">
              <Text className="text-xs font-medium text-indigo-200">{categoryLabels[team.category] || team.category}</Text>
            </View>
            <View className={`ml-2 rounded-full px-3 py-1 ${stageColors[team.stage]?.replace("text-", "text-indigo-200 bg-") || "bg-indigo-900/50"}`}>
              <Text className="text-xs font-medium capitalize text-indigo-200">{team.stage?.toLowerCase()}</Text>
            </View>
            <Text className="ml-auto text-sm font-medium text-white">{team._count?.members ?? team.members?.length ?? 0} members</Text>
          </View>
          {team.description && (
            <Text className="mt-4 leading-6 text-slate-300">{team.description}</Text>
          )}
          {team.owner && (
            <TouchableOpacity onPress={() => router.push(`/profile/${team.ownerId}`)} className="mt-5 flex-row items-center">
              <AvatarWithFallback uri={team.owner.avatar} name={team.owner.name?.[0] ?? "?"} size={28} />
              <Text className="ml-2 text-sm text-slate-300">by {team.owner.name}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="mt-6 mb-4 flex-row flex-wrap">
          <TouchableOpacity onPress={() => setDetailTab("roles")} className={`mr-2 mb-2 rounded-full px-5 py-2.5 ${detailTab === "roles" ? "bg-brand" : "bg-white"}`}>
            <Text className={`text-sm font-semibold ${detailTab === "roles" ? "text-white" : "text-muted"}`}>Open Roles ({team.roles?.filter((r: any) => r.isOpen).length ?? 0})</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDetailTab("members")} className={`mr-2 mb-2 rounded-full px-5 py-2.5 ${detailTab === "members" ? "bg-brand" : "bg-white"}`}>
            <Text className={`text-sm font-semibold ${detailTab === "members" ? "text-white" : "text-muted"}`}>Members ({team._count?.members ?? team.members?.length ?? 0})</Text>
          </TouchableOpacity>
          {isOwner && (
            <TouchableOpacity onPress={() => setDetailTab("applications")} className={`rounded-full px-5 py-2.5 ${detailTab === "applications" ? "bg-brand" : "bg-white"}`}>
              <Text className={`text-sm font-semibold ${detailTab === "applications" ? "text-white" : "text-muted"}`}>Applications</Text>
            </TouchableOpacity>
          )}
        </View>

        {detailTab === "roles" && (
          <>
            {team.roles?.filter((r: any) => r.isOpen).length > 0 ? (
              team.roles.filter((r: any) => r.isOpen).map((role: any) => (
                <View key={role.id} className="mb-4 rounded-3xl bg-white p-5">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-semibold text-ink">{role.title}</Text>
                    <View className="rounded-full bg-indigo-50 px-3 py-1">
                      <Text className="text-xs font-medium text-brand">{role._count?.applications ?? 0} applicants</Text>
                    </View>
                  </View>
                  {role.description && (
                    <Text className="mt-2 text-sm leading-5 text-muted">{role.description}</Text>
                  )}
                  {role.skillsNeeded?.length > 0 && (
                    <View className="mt-3 flex-row flex-wrap">
                      {role.skillsNeeded.map((skill: string, i: number) => (
                        <View key={i} className="mr-2 mb-1 rounded-full bg-gray-100 px-3 py-1">
                          <Text className="text-xs font-medium text-gray-600">{skill}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {!isMember && !isOwner && (
                    <AppButton label="Apply" onPress={() => setApplyRoleId(role.id)} className="mt-3" />
                  )}
                  {isOwner && (
                    <CloseRoleButton roleId={role.id} />
                  )}
                </View>
              ))
            ) : (
              <View className="mt-8 items-center">
                <Text className="text-muted">No open roles right now</Text>
              </View>
            )}
            {isOwner && (
              <AppButton label="+ Add Role" onPress={() => setAddRoleOpen(true)} className="mt-2" />
            )}
          </>
        )}

        {detailTab === "members" && (
          <View>
            {team.members?.map((m: any) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => router.push(`/profile/${m.userId}`)}
                className="mb-3 flex-row items-center rounded-3xl bg-white p-4"
              >
                <AvatarWithFallback uri={m.user?.avatar} name={m.user?.name?.[0] ?? "?"} size={44} />
                <View className="ml-4 flex-1">
                  <Text className="font-semibold text-ink">{m.user?.name}</Text>
                  <Text className="text-xs text-muted">{m.role === "OWNER" ? "Owner" : "Member"}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {detailTab === "applications" && isOwner && (
          <ApplicationsSection teamId={teamId!} />
        )}
      </ScrollView>

      {/* Apply Modal */}
      <Modal visible={!!applyRoleId} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setApplyRoleId(null)}>
        <SafeAreaView className="flex-1 bg-surface">
          <View className="flex-1 px-6">
            <View className="mt-4 mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-ink">Apply for Role</Text>
              <TouchableOpacity onPress={() => setApplyRoleId(null)}>
                <Ionicons name="close" size={24} color="#101828" />
              </TouchableOpacity>
            </View>
            <Text className="mb-3 text-sm font-semibold text-ink">Why do you want to join? (optional)</Text>
            <TextInput
              placeholder="Share your motivation, skills, or experience..."
              placeholderTextColor="#98A2B3"
              multiline
              className="mb-6 min-h-[140px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-ink"
              value={applyMessage}
              onChangeText={setApplyMessage}
              maxLength={500}
            />
            <AppButton label="Submit Application" onPress={handleApply} loading={applyMutation.isPending} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Add Role Modal */}
      <Modal visible={addRoleOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddRoleOpen(false)}>
        <SafeAreaView className="flex-1 bg-surface">
          <ScrollView contentContainerClassName="px-6 pb-8">
            <View className="mt-4 mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-ink">Add Role</Text>
              <TouchableOpacity onPress={() => setAddRoleOpen(false)}>
                <Ionicons name="close" size={24} color="#101828" />
              </TouchableOpacity>
            </View>
            <Text className="mb-2 text-sm font-semibold text-ink">Role Title *</Text>
            <TextInput
              placeholder="e.g. Growth Marketer"
              placeholderTextColor="#98A2B3"
              className="mb-4 h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-ink"
              value={roleTitle}
              onChangeText={setRoleTitle}
            />
            <Text className="mb-2 text-sm font-semibold text-ink">Description (optional)</Text>
            <TextInput
              placeholder="What will this role do?"
              placeholderTextColor="#98A2B3"
              multiline
              className="mb-4 min-h-[100px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-ink"
              value={roleDesc}
              onChangeText={setRoleDesc}
            />
            <Text className="mb-2 text-sm font-semibold text-ink">Skills Needed (comma separated)</Text>
            <TextInput
              placeholder="Marketing, SEO, Content"
              placeholderTextColor="#98A2B3"
              className="mb-6 h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-ink"
              value={roleSkills}
              onChangeText={setRoleSkills}
            />
            <AppButton label="Add Role" onPress={handleAddRole} loading={addRoleMutation.isPending} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function CloseRoleButton({ roleId }: { roleId: string }) {
  const handleClose = async () => {
    try {
      await api.put(`/teams/roles/${roleId}`, { isOpen: false });
      Alert.alert("Done", "Role closed");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e.message);
    }
  };
  return (
    <AppButton label="Close Role" variant="outline" onPress={handleClose} className="mt-2" />
  );
}

function ApplicationsSection({ teamId }: { teamId: string }) {
  const { data: team } = useTeamDetail(teamId);
  const router = useRouter();

  const roles = team?.roles ?? [];

  if (roles.length === 0) {
    return (
      <View className="mt-8 items-center">
        <Text className="text-muted">No applications yet</Text>
      </View>
    );
  }

  return (
    <>
      {roles.map((role: any) =>
        role.applications?.length > 0 ? (
          <View key={role.id} className="mb-6">
            <Text className="mb-3 text-sm font-semibold text-ink">{role.title} ({role.applications.length} appl{(role.applications.length) > 1 ? "s" : ""})</Text>
            {role.applications.map((app: any) => (
              <View key={app.id} className="mb-3 rounded-3xl bg-white p-5">
                <TouchableOpacity onPress={() => router.push(`/profile/${app.applicantId}`)} className="flex-row items-center">
                  <AvatarWithFallback uri={app.applicant?.avatar} name={app.applicant?.name?.[0] ?? "?"} size={36} />
                  <Text className="ml-3 font-semibold text-ink">{app.applicant?.name}</Text>
                </TouchableOpacity>
                {app.message && <Text className="mt-2 text-sm text-muted">{app.message}</Text>}
                <View className="mt-3">
                  {app.status === "PENDING" ? (
                    <View className="flex-row">
                      <AcceptBtn appId={app.id} />
                      <RejectBtn appId={app.id} />
                    </View>
                  ) : (
                    <View className={`self-start rounded-full px-3 py-1 ${app.status === "ACCEPTED" ? "bg-green-100" : "bg-red-100"}`}>
                      <Text className={`text-xs font-medium ${app.status === "ACCEPTED" ? "text-green-700" : "text-red-600"}`}>{app.status}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : null
      )}
      {roles.every((r: any) => !r.applications?.length) && (
        <View className="mt-8 items-center">
          <Text className="text-muted">No applications yet</Text>
        </View>
      )}
    </>
  );
}

function AcceptBtn({ appId }: { appId: string }) {
  const { mutateAsync, isPending } = useAcceptApplication();
  const handleAccept = async () => {
    try {
      await mutateAsync(appId);
      Alert.alert("Accepted", "Applicant has been added to the team");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e.message);
    }
  };
  return <AppButton label="Accept" onPress={handleAccept} loading={isPending} className="mr-2 flex-1" />;
}

function RejectBtn({ appId }: { appId: string }) {
  const { mutateAsync, isPending } = useRejectApplication();
  const handleReject = async () => {
    try {
      await mutateAsync(appId);
      Alert.alert("Rejected", "Application has been rejected");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e.message);
    }
  };
  return <AppButton label="Reject" variant="outline" onPress={handleReject} loading={isPending} className="flex-1" />;
}
