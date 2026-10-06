interface MemberData {
    member_num: number,
    pwd: string,
}

export const getMember = () => {
    const member:MemberData = {
        member_num: 0,
        pwd: "0"
    }
    return member;
}