#!/usr/bin/expect  
#author: yifangyou  
#create time:2011-05-17  
#host  
set scphost "[lindex $argv 0]" 
#ssh端口  
set port "[lindex $argv 1]" 
#ssh用户名  
set scpuser "[lindex $argv 2]" 
#ssh密码  
set scppw "[lindex $argv 3]" 
spawn ssh -X $scpuser@$scphost
# send ls 
#设置超时时间，防止远程机器防火墙没有开，而挂起  
set timeout 2

# ====登入=====
expect {  
    #respose: "root@1.2.3.4's password:",自动输入密码
    "*password*" {  
    send "$scppw\r" 
    }  
    #the first connect will respose "Are you sure you want to continue connecting (yes/no)? yes" 
    "*yes*" {  
    send "yes\r" 
    expect "*password*" 
    send "$scppw\r" 
    }  
    busy {send_user "\n***************<error:busy>";exit 1;}  
    failed {send_user "\n***************<error:failed>";exit 2;}  
    timeout {send_user "\n***************<error:timeout>";exit 3;}  
}

    # send "sudo ssh-keygen -f '/root/.ssh/known_hosts' -R '140.109.80.93'"
    # expect "*Host 140.109.80.93*"

# ====執行指令1=====
expect {
    # 刪除舊的ssh keygen
    "$*" {
        send "sudo ssh-keygen -f '/root/.ssh/known_hosts' -R '140.109.80.93'\r"
        set timeout 5
        exp_continue
    }

    # 匹配 scp 指令和輸入密碼
    "*Host 140.109.80.93*" {
        send "sudo scp andy@140.109.80.93:~/QSIS/update_git_credentials.sh ~/Desktop/\r"
        set timeout 5
        exp_continue
    }
    # 匹配 scp 指令和輸入密碼
    "*No such file*" {
        send "sudo scp andy@140.109.80.93:~/QSIS/update_git_credentials.sh ~/Desktop/\r"
        set timeout 5
        exp_continue
    }
    
    # 匹配密碼輸入
    "*password*" {
        send "ji3948vu84\r"
    }
    # 匹配 ssh 遠端連線確認
    "*yes*" {
        send "yes\r"
        expect "*password*"
        send "ji3948vu84\r"
    }
    # 匹配其他錯誤情況
    "*denied*" {
        send_user "\n***************<error:Permission denied>"
        exit 4
    }
    busy {
        send_user "\n***************<error:busy>"
        exit 1
    }
    failed {
        send_user "\n***************<error:failed>"
        exit 2
    }
    timeout {
        send_user "\n***************<error:timeout>"
        exit 3
    }
}

# ====執行指令2=====
expect { 
    "*update_git_credentials.sh*100%*" {
        send "bash /home/pi/Desktop/update_git_credentials.sh\r" 
        set timeout 5
        exp_continue
    }
    "create mode*" {  
        send "sudo reboot\r" 
        send_user "\n***************<sucess:Update sucessed!>" 
        exit 4  
    }  
    "Already up to date.*" {  
        send "sudo reboot\r" 
        send_user "\n***************<error:Already update!>" 
        exit 5  
    } 
    busy {
        send_user "\n***************<error:busy>"
        exit 1
    }
    failed {
        send_user "\n***************<error:failed>"
        exit 2
    }
    timeout {
        send_user "\n***************<error:timeout>"
        exit 3
    }
}

# ====執行完sh檔退出pi=====
expect eof { 
	exit 0
}



