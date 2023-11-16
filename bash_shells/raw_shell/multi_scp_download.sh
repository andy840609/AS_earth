#!/bin/bash  
#author: yifangyou  
#create time:2011-05-17  
#用来通过scp批量下载目标机器文件或者目录到指定目录  
#下载完毕后分别把文件在指定目录下按照ssh_host的ip生成目录里  
#例如：/root/download/1.1.1.1/a.txt /root/download/2.2.2.2/a.txt  
#配置文件格式：  
#ssh_hosts=("1.1.1.1" "2.2.2.2")  
#ssh_ports=("22" "22") 这个可以缺省，缺省值为22,或者个数比ssh_hosts少时，使用缺省值  
#ssh_users=("root" "root") 这个可以缺省，缺省值为root，,或者个数比ssh_hosts少时，使用缺省值  
#ssh_passwords=("323" "222") 这个可以缺省，缺省的话需要从命令行输入,或者个数比ssh_hosts少时，使用命令行输入  
#执行：sh multi_scp_download.sh conf_file_path target local_dir  
if [ -z "$3" ]  
then 
echo "sh multi_scp_download.sh conf_file_path target local_dir";  
exit;  
fi  
default_ssh_user="pi" 
default_ssh_port="22";  
#upload shell script file path  
scp_upload=scp_upload.sh  
#configure file path  
conf_file=$1  
#remote host'target file or dir path  
scp_target=$2  
#then local file path or dir path  
scp_local_dir=$3  
#判断conf_file配置文件是存在  
if [ ! -e "$conf_file" ]  
then 
echo "$conf_file is not exists";  
exit;  
fi  
if [ ! -d "$scp_local_dir" ]  
then 
echo "$scp_local_dir is not exists and must be a dir";  
exit;  
fi  
#read configure file  
source $conf_file  
#若是没有在配置文件里提供密码，则在命令行输入  
if [ "${#ssh_passwords[@]}" = "0" ] || [ "${#ssh_passwords[@]}" -lt "${#ssh_hosts[@]}" ]  
then 
read -p "please input password:" -s default_ssh_password  
fi  

for((i=0;i<${#ssh_hosts[@]};i++))  
	do  
	#remote ssh host  
	ssh_host=${ssh_hosts[$i]};  
	if [ "$ssh_host" != "" ]  
	then 
	#remote ssh port  
	ssh_port=${ssh_ports[$i]};  
	if [ "$ssh_port" = "" ]  
	then 
	ssh_port=$default_ssh_port; #use default value  
	fi  
	#remote ssh user 
	ssh_user=${ssh_users[$i]};  
	if [ "$ssh_user" = "" ]  
	then 
	ssh_user=$default_ssh_user; #use default value  
	fi  
	#remote ssh password 
	ssh_password=${ssh_passwords[$i]};  
	if [ "$ssh_password" = "" ]  
	then 
	ssh_password=$default_ssh_password; #use default value  
	fi  
	scp_local_dir_host=$scp_local_dir/$ssh_host/  
	mkdir -p $scp_local_dir_host 
	echo "["`date +"%F %T"`"] (scp -r $ssh_user@$ssh_host:$ssh_port:$scp_target $scp_local_dir_host) start" 
	#scp file or dir  
	/usr/bin/expect scp_download.sh "$ssh_host" "$ssh_port" "$ssh_user" "$ssh_password" "$scp_target" "$scp_local_dir_host" 
	echo "["`date +"%F %T"`"] (scp -r $ssh_user@$ssh_host:$ssh_port:$scp_target $scp_local_dir_host) end" 
	echo "" 
	else 
	echo "ssh_host[$i]=null" 
	fi  
	done 
