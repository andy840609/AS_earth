#!/bin/env python
import math
from math import *

import matplotlib.pyplot as plt

#STS-2.5 NCB
z=([]) 

p=([ 	-9.810000e+02	+1.009000e+03j,
	-9.810000e+02	-1.009000e+03j,
	-3.290000e+03	+1.263000e+03j,
	-3.290000e+03	-1.263000e+03j ])

nz=len(z)
np=len(p)
print('NZ = ',nz)
print('NP = ',np)

f0=1 #Normalization frequency (Hz)
twopi=2*math.pi
w0=twopi*f0
iw0=complex(0,w0)
rad=180/math.pi

#print('pi,rad=',math.pi,rad)

fq0=0.001 #Hz
fq1=1000  #Hz
ip0=log10(fq0)
ip1=log10(fq1)
nprd=201
dprd=(ip1-ip0)/(nprd-1)

frq=[0]*nprd
amp=[0]*nprd
phs=[0]*nprd

count = 0
while count < nprd:
  frq[count] = 10**(ip0+dprd*count)
#  print('count, Freq. = ',count, frq[count])
  w=twopi*frq[count]
  iw=complex(0,w)
  top=1.+0j
  for i in range(0,nz):
#     print('i,top',i,top)
     top=top*(iw-z[i])

  btm=1.+0j
  for i in range(0,np):
     btm=btm*(iw-p[i])

  resp=top/btm
  amp[count]=abs(resp)
  phs[count]=math.atan2(resp.imag,resp.real)*rad

  count += 1

#compute the normalization factor at f0
top=1.+0j
for i in range(0,nz):
    top=top*(iw0-z[i])

btm=1.+0j
for i in range(0,np):
    btm=btm*(iw0-p[i])

resp=top/btm
nf=1./abs(resp)
print('Normalization facotr = ',nf)
amp=[i*nf for i in amp]
print('amp = ',amp)

fig,(ax1,ax2)=plt.subplots(2,1,figsize=[7,11])
ax1.loglog(frq,amp,'-r',linewidth=2, label='Amplitude')
ax1.set_title('Amplitude Response',fontsize=15)
#ax1.set_xlabel('Frequency (Hz)',fontsize=13)
ax1.set_ylabel('Normalized Ampliutde',fontsize=13)
#ax1.legend()

ax2.semilogx(frq,phs,'-b',linewidth=2, label='Phase')
ax2.set_title('Phase Response',fontsize=15)
ax2.set_xlabel('Frequency (Hz)',fontsize=13)
ax2.set_ylabel('Phase (deg.)',fontsize=13)
#ax2.legend()

ax1.grid()
ax2.grid()
#plt.tight_layout()
plt.show()

