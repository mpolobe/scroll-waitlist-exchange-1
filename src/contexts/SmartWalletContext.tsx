// Alchemy hooks - always call unconditionally (they return defaults when not configured)
const alchemyUser = useUser();
const { account, isLoadingAccount } = useAccount({ type: "ModularAccountV2" });
const { client: alchemyClient } = useSmartAccountClient({ type: "ModularAccountV2" });
const { openAuthModal } = useAuthModal();
const { logout: alchemyLogout } = useLogout();
